import Price from "shared/Price";
import FurnaceDropper from "./FurnaceDropper";
import Droplet from "./Droplet";

class Condenser extends FurnaceDropper {

    quotasPerDroplet = new Map<Droplet, number>();

    constructor(id: string) {
        super(id);
        this.types.push("Condenser");
        this.onLoad((model, utils, item) => {
            const instantiatorsPerDroplet = new Map<Droplet, () => void>();
            const quotasPerDroplet = item.getQuotasPerDroplet();
            for (const [droplet] of quotasPerDroplet) {
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
                    let isInstantiate = true;
                    const price = droplet.getValue()?.mul(quota);
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
                    const price = droplet.getValue()?.mul(quota);
                    if (price === undefined) {
                        return;
                    }
                    for (const [currency, cost] of pairs(price.costPerCurrency)) {
                        const progress = current.getCost(currency)?.div(cost).Reverse();
                        const bar = surfaceGui.WaitForChild(currency + "Bar");
                        (bar.WaitForChild("Fill") as Frame).Size = new UDim2(progress === undefined ? 0 : math.min(progress, 1), 0, 1, 0);
                        (bar.WaitForChild("PercentageLabel") as TextLabel).Text = (math.floor((progress ?? 0) * 10000) / 100) + "%";
                    }
                });
            }
            update();
            event.Event.Connect((raw?: Price) => {
                if (raw !== undefined) {
                    current = current.add(new Price(raw.costPerCurrency));
                    check();
                    update();
                }
            });
            item.repeat(model, () => check(), 0.4);
        });
        this.onProcessed((model, _utils, _item, _worth, raw) => {
            const event = model.FindFirstChildOfClass("BindableEvent");
            if (event !== undefined) {
                event.Fire(raw);
            }
        });
    }

    getQuotasPerDroplet() {
        return this.quotasPerDroplet;
    }

    setQuotasPerDroplet(quotasPerDroplet: Map<Droplet, number>) {
        this.quotasPerDroplet = quotasPerDroplet;
        return this;
    }

    setDropletQuota(droplet: Droplet, percentage: number) {
        const quotasPerDroplet = this.getQuotasPerDroplet();
        quotasPerDroplet.set(droplet, percentage);
        this.setQuotasPerDroplet(quotasPerDroplet);
        return this;
    }
}

export = Condenser;