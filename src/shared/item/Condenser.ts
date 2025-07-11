import { OnoeNum } from "@antivivi/serikanum";
import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Dropper from "shared/item/Dropper";
import Packets from "shared/network/Packets";
import ItemUtils, { GameUtils } from "shared/utils/ItemUtils";
import Droplet from "./Droplet";

declare global {
    interface ItemTypes {
        Condenser: Condenser;
    }

    interface InstanceInfo {
        Condensed?: boolean;
    }
}

class Condenser extends Dropper {

    quotasPerDroplet = new Map<Droplet, number>();

    constructor(id: string) {
        super(id);
        this.types.add("Condenser");
        this.acceptsGlobalBoosts(false);
        this.onLoad((model, item) => {
            const areaId = GameUtils.itemsService.getPlacedItem(model.Name)?.area;
            if (areaId === undefined)
                return;
            const area = AREAS[areaId as AreaId];
            const dropletLimit = area.dropletLimit;
            const dropletCountPerArea = GameUtils.dropletCountPerArea;
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
                instantiatorsPerDroplet.set(droplet, Dropper.wrapInstantiator(drop, droplet.getInstantiator(model, drop.CFrame), item as Dropper));
            }
            const event = new Instance("BindableEvent");
            event.Parent = model;
            const surfaceGui = model.WaitForChild("GuiPart").FindFirstChildOfClass("SurfaceGui");
            const lava = model.WaitForChild("Lava");
            if (surfaceGui === undefined) {
                return;
            }
            let current = new Price();
            const upgrades = new Map<string, UpgradeInfo>();

            const check = () => {
                pricePerDroplet.forEach((price, droplet) => {
                    const dropletCount = dropletCountPerArea.get(areaId as AreaId);
                    if (dropletCount === undefined || dropletCount > dropletLimit.Value) {
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
                    if (isInstantiate === true) {
                        current = current.sub(price);
                        const instantiator = instantiatorsPerDroplet.get(droplet);
                        if (instantiator !== undefined) {
                            const droplet = instantiator();
                            const instanceInfo = GameUtils.getAllInstanceInfo(droplet);
                            for (const [id, upgradeInfo] of upgrades) {
                                let upgrades = instanceInfo.Upgrades ?? new Map();
                                const pointer = table.clone(upgradeInfo);
                                pointer.EmptyUpgrade = true;
                                upgrades.set(id, pointer);
                                instanceInfo.Upgrades = upgrades;
                            }
                            instanceInfo.Condensed = true;
                        }
                    }
                });
                update();
            };
            const update = () => {
                pricePerDroplet.forEach((price) => {
                    for (const [currency, cost] of pairs(price.costPerCurrency)) {
                        const progress = current.getCost(currency)?.div(cost).revert() ?? 0;
                        const bar = surfaceGui.WaitForChild(currency + "Bar");
                        (bar.WaitForChild("Fill") as Frame).Size = new UDim2(math.min(progress, 1), 0, 1, 0);
                        (bar.WaitForChild("PercentageLabel") as TextLabel).Text = math.floor(progress * 100) + "%";
                    }
                });
            };
            update();
            const ZERO = new OnoeNum(0);
            const CurrencyService = GameUtils.currencyService;
            const RevenueService = GameUtils.revenueService;
            event.Event.Connect((raw?: Price, dropletModel?: BasePart) => {
                if (raw !== undefined && dropletModel !== undefined) {
                    const instanceInfo = GameUtils.getAllInstanceInfo(dropletModel);
                    if (instanceInfo.DropletId === undefined || instanceInfo.Condensed === true) {
                        return;
                    }
                    const currentMap = current.costPerCurrency;
                    const lostCurrencies = new Map<Currency, OnoeNum>();
                    for (const [currency, cost] of raw.costPerCurrency) {
                        const prev = currentMap.get(currency);
                        let newCost = prev === undefined ? cost : prev.add(cost);
                        const limit = maxCosts.get(currency);
                        if (limit === undefined) {
                            if (ZERO.lessThan(cost)) {
                                lostCurrencies.set(currency, new OnoeNum(cost));
                            }
                        }
                        else {
                            currentMap.set(currency, OnoeNum.min(newCost, limit));
                        }
                    }

                    if (!lostCurrencies.isEmpty()) {
                        CurrencyService.incrementCurrencies(RevenueService.applySoftcaps(lostCurrencies));
                        Packets.dropletBurnt.fireAll(dropletModel.Name, lostCurrencies, model.Name, lava.Name, ItemUtils.clientDroplets);
                    }
                    const upgrades = instanceInfo.Upgrades;
                    if (upgrades !== undefined) {
                        for (const [id, upgrade] of upgrades) {
                            upgrades.set(id, upgrade);
                        }
                    }
                    check();
                    update();
                }
            });
            item.repeat(model, () => check(), 0.4);
        });
        this.onProcessed((model, _item, worth, droplet) => {
            const event = model.FindFirstChildOfClass("BindableEvent");
            if (event !== undefined) {
                event.Fire(worth, droplet);
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