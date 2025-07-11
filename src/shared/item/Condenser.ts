//!native

import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Dropper from "shared/item/Dropper";
import { OnoeNum } from "@antivivi/serikanum";
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

            const instantiatorsPerDroplet = new Map<Droplet, () => BasePart>();
            const pricePerDroplet = new Map<Droplet, Price>();
            const maxCosts = new Map<Currency, OnoeNum>();
            for (const [droplet, quota] of this.quotasPerDroplet) {
                const value = droplet.value;
                if (value === undefined)
                    continue;
                const price = value.mul(quota);
                pricePerDroplet.set(droplet, price);
                for (const [currency, cost] of price.costPerCurrency) {
                    maxCosts.set(currency, cost.mul(10));
                }
                const drop = model.WaitForChild("Drop") as BasePart;
                instantiatorsPerDroplet.set(droplet, Dropper.wrapInstantiator(drop, droplet.getInstantiator(model, drop.CFrame, utils)));
            }
            const event = new Instance("BindableEvent");
            event.Parent = model;
            const surfaceGui = model.WaitForChild("GuiPart").FindFirstChildOfClass("SurfaceGui");
            if (surfaceGui === undefined) {
                return;
            }
            let current = new Price();
            const upgrades = new Map<string, Model>();
            const check = () => {
                pricePerDroplet.forEach((price, droplet) => {
                    if (dropletCount.Value > dropletLimit.Value) {
                        return;
                    }
                    let isInstantiate = true;
                    for (const [currency, cost] of pairs(price.costPerCurrency)) {
                        const currentCost = current.getCost(currency);
                        if (currentCost === undefined || currentCost.lessThan(cost)) {
                            isInstantiate = false;
                            break;
                        }
                    }
                    if (isInstantiate) {
                        current = current.sub(price);
                        const instantiator = instantiatorsPerDroplet.get(droplet);
                        if (instantiator !== undefined) {
                            const droplet = instantiator();
                            for (const [upgraderId, upgraderModel] of upgrades) {
                                const pointer = new Instance("ObjectValue");
                                pointer.Name = upgraderId;
                                pointer.Value = upgraderModel;
                                pointer.SetAttribute("ItemId", upgraderModel.GetAttribute("ItemId"));
                                pointer.SetAttribute("EmptyUpgrade", true);
                                pointer.Parent = droplet;
                            }
                            droplet.SetAttribute("Condensed", true);
                        }
                    }
                });
                update();
            }
            const update = () => {
                pricePerDroplet.forEach((price) => {
                    for (const [currency, cost] of pairs(price.costPerCurrency)) {
                        const progress = current.getCost(currency)?.div(cost).revert() ?? 0;
                        const bar = surfaceGui.WaitForChild(currency + "Bar");
                        (bar.WaitForChild("Fill") as Frame).Size = new UDim2(math.min(progress, 1), 0, 1, 0);
                        (bar.WaitForChild("PercentageLabel") as TextLabel).Text = math.floor(progress * 100) + "%";
                    }
                });
            }
            update();
            event.Event.Connect((raw?: Price, dropletModel?: BasePart) => {
                if (raw !== undefined && dropletModel !== undefined) {
                    const id = dropletModel.GetAttribute("DropletId") as string;
                    if (id === undefined || dropletModel.GetAttribute("Condensed") === true) {
                        return;
                    }
                    const newCurrent = current.add(new Price(raw.costPerCurrency));
                    for (const [currency, cost] of newCurrent.costPerCurrency) {
                        const limit = maxCosts.get(currency);
                        if (limit === undefined || cost.lessThan(limit))
                            continue;
                        newCurrent.setCost(currency, limit);
                    }
                    for (const upgrade of dropletModel.GetChildren()) {
                        if (upgrade.IsA("ObjectValue")) {
                            upgrades.set(upgrade.Name, upgrade.Value as Model);
                        }
                    }
                    current = newCurrent;
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