import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Droplet from "./Droplet";
import FurnaceDropper from "./FurnaceDropper";

class Condenser extends FurnaceDropper {

    quotasPerDroplet = new Map<Droplet, number>();

    constructor(id: string) {
        super(id);
        this.types.push("Condenser");
        this.onLoad((model, utils, item) => {
            const areaId = utils.getPlacedItem(model.Name)?.area;
            const area = AREAS[areaId as keyof (typeof AREAS)];
            const dropletLimit = area.dropletLimit;
            const dropletCount = area.areaFolder.WaitForChild("DropletCount") as IntValue;

            const bannedDroplets = new Array<string>();
            const instantiatorsPerDroplet = new Map<Droplet, () => void>();
            const quotasPerDroplet = item.quotasPerDroplet;
            for (const [droplet] of quotasPerDroplet) {
                bannedDroplets.push(droplet.id);
                instantiatorsPerDroplet.set(droplet, droplet.getInstantiator(model, (model.WaitForChild("Drop") as BasePart).CFrame, utils));
            }
            const event = new Instance("BindableEvent");
            event.Parent = model;
            const surfaceGui = model.WaitForChild("GuiPart").FindFirstChildOfClass("SurfaceGui");
            if (surfaceGui === undefined) {
                return;
            }
            let current = new Price();
            const check = () => {
                quotasPerDroplet.forEach((quota, droplet) => {
                    if (dropletCount.Value > dropletLimit.Value) {
                        return;
                    }
                    
                    let isInstantiate = true;
                    const price = droplet.value?.mul(quota);
                    if (price === undefined) {
                        return;
                    }
                    for (const [currency, cost] of pairs(price.costPerCurrency)) {
                        const currentCost = current.getCost(currency);
                        if (currentCost === undefined || currentCost.lt(cost)) {
                            isInstantiate = false;
                            break;
                        }
                    }
                    if (isInstantiate) {
                        current = current.sub(price);
                        const instantiator = instantiatorsPerDroplet.get(droplet);
                        if (instantiator !== undefined) {
                            instantiator();
                        }
                    }
                });
            }
            const update = () => {
                quotasPerDroplet.forEach((quota, droplet) => {
                    let price = droplet.value;
                    if (price === undefined) {
                        return;
                    }
                    price = price.mul(quota);
                    for (const [currency, cost] of pairs(price.costPerCurrency)) {
                        const progress = math.min(current.getCost(currency)?.div(cost).Reverse() ?? 0, 10);
                        const bar = surfaceGui.WaitForChild(currency + "Bar");
                        (bar.WaitForChild("Fill") as Frame).Size = new UDim2(math.min(progress, 1), 0, 1, 0);
                        (bar.WaitForChild("PercentageLabel") as TextLabel).Text = (math.floor(progress * 10000) / 100) + "%";
                    }
                });
            }
            update();
            event.Event.Connect((raw?: Price, dropletModel?: BasePart) => {
                if (raw !== undefined && dropletModel !== undefined) {
                    const id = dropletModel.GetAttribute("DropletId") as string;
                    if (id === undefined || bannedDroplets.includes(id)) {
                        return;
                    }
                    current = current.add(new Price(raw.costPerCurrency));
                    check();
                    update();
                }
            });
            item.repeat(model, () => check(), 0.4);
        });
        this.onProcessed((model, _utils, _item, _worth, raw, droplet) => {
            const event = model.FindFirstChildOfClass("BindableEvent");
            if (event !== undefined) {
                event.Fire(raw, droplet);
            }
        });
    }

    setQuotasPerDroplet(quotasPerDroplet: Map<Droplet, number>) {
        this.quotasPerDroplet = quotasPerDroplet;
        return this;
    }

    setDropletQuota(droplet: Droplet, percentage: number) {
        this.quotasPerDroplet.set(droplet, percentage);
        return this;
    }
}

export = Condenser;