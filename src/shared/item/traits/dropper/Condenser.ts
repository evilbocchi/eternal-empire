import { OnoeNum } from "@rbxts/serikanum";
import { getAllInstanceInfo, setInstanceInfo } from "@antivivi/vrldk";
import { packet } from "@rbxts/fletchette";
import { Server } from "shared/api/APIExpose";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Dropper from "shared/item/traits/dropper/Dropper";
import Furnace from "shared/item/traits/Furnace";
import ItemTrait from "shared/item/traits/ItemTrait";
import isPlacedItemUnusable from "shared/item/utils/isPlacedItemUnusable";
import perItemPacket from "shared/item/utils/perItemPacket";
import Packets from "shared/Packets";
import { AREAS } from "shared/world/Area";
import Droplet from "shared/item/Droplet";

declare global {
    interface ItemTraits {
        Condenser: Condenser;
    }

    interface InstanceInfo {
        /**
         * Whether the droplet has been produced by a condenser.
         * Used to prevent condensers from feeding into each other.
         */
        Condensed?: boolean;
    }
}

const storeChangedPacket = perItemPacket(packet<(placementId: string, current: BaseCurrencyMap) => void>());

/**
 * A condenser is an item that 'condenses' multiple droplets into a single droplet, usually of higher value.
 */
export default class Condenser extends ItemTrait {
    droplets = new Array<Droplet>();
    totalValue = new CurrencyBundle();

    quota = 1;

    static getPricePerDroplet(condenser: Condenser) {
        const pricePerDroplet = new Map<Droplet, CurrencyBundle>();
        for (const droplet of condenser.droplets) {
            const value = droplet.value;
            if (value === undefined) continue;
            const price = value.mul(condenser.quota);
            pricePerDroplet.set(droplet, price);
        }
        return pricePerDroplet;
    }

    static load(model: Model, condenser: Condenser) {
        const modelInfo = getAllInstanceInfo(model);

        const item = condenser.item;
        const dropper = item.trait(Dropper);
        const areaId = Server.Item.getPlacedItem(model.Name)?.area;
        const area = areaId !== undefined ? AREAS[areaId as AreaId] : undefined;
        const instantiatorsPerDroplet = new Map<Droplet, () => BasePart>();
        const pricePerDroplet = Condenser.getPricePerDroplet(condenser);
        const maxCosts = new Map<Currency, OnoeNum>();
        for (const [, price] of pricePerDroplet) {
            for (const [currency, amount] of price.amountPerCurrency) {
                maxCosts.set(currency, amount.mul(10));
            }
        }
        for (const droplet of condenser.droplets) {
            const drop = model.WaitForChild("Drop") as BasePart;
            instantiatorsPerDroplet.set(
                droplet,
                Dropper.wrapInstantiator(droplet.getInstantiator(model, drop), dropper, model, drop),
            );
        }

        let current = new CurrencyBundle();
        const upgrades = new Map<string, UpgradeInfo>();

        const check = (force?: boolean) => {
            if (isPlacedItemUnusable(modelInfo)) {
                return;
            }

            let changed = false;
            pricePerDroplet.forEach((price, droplet) => {
                if (area !== undefined && area.dropletCount > area.getDropletLimit()) {
                    return;
                }
                let dontResetUpgrades = false;
                for (const [currency, amount] of pairs(price.amountPerCurrency)) {
                    const currentCost = current.get(currency);
                    if (currentCost === undefined) return;

                    const percentage = currentCost.div(amount);
                    if (percentage.lessThan(1)) {
                        return;
                    }
                    if (percentage.moreThan(1.15)) dontResetUpgrades = true;
                }

                current.sub(price, true);
                changed = true;
                const instantiator = instantiatorsPerDroplet.get(droplet);
                if (instantiator !== undefined) {
                    const droplet = instantiator();
                    const instanceInfo = getAllInstanceInfo(droplet);
                    const replacingUpgrades = instanceInfo.Upgrades ?? new Map();
                    for (const [id, upgradeInfo] of upgrades) {
                        const pointer = table.clone(upgradeInfo);
                        pointer.EmptyUpgrade = true;
                        replacingUpgrades.set(id, pointer);
                    }
                    if (!dontResetUpgrades) upgrades.clear();
                    instanceInfo.Upgrades = replacingUpgrades;
                    instanceInfo.Condensed = true;
                }
            });
            if (changed || force === true) {
                storeChangedPacket.toAllClients(model, current.amountPerCurrency);
            }
        };

        const ZERO = new OnoeNum(0);
        const CurrencyService = Server.Currency;
        const RevenueService = Server.Revenue;
        setInstanceInfo(model, "FurnaceProcessed", (_, raw, droplet) => {
            const instanceInfo = getAllInstanceInfo(droplet);
            if (instanceInfo.DropletId === undefined || instanceInfo.Condensed === true) {
                return;
            }

            const currentMap = current.amountPerCurrency;
            const lostValue = new Map<Currency, OnoeNum>();
            for (const [currency, amount] of raw.amountPerCurrency) {
                const prev = currentMap.get(currency);
                const newCost = prev === undefined ? amount : prev.add(amount);
                const limit = maxCosts.get(currency);
                if (limit === undefined) {
                    if (ZERO.lessThan(amount)) {
                        lostValue.set(currency, amount);
                    }
                } else {
                    currentMap.set(currency, OnoeNum.min(newCost, limit));
                }
            }

            if (!lostValue.isEmpty()) {
                const lostCurrencies = RevenueService.performSoftcaps(lostValue);
                CurrencyService.incrementAll(lostCurrencies);
                Packets.dropletBurnt.toAllClients(droplet.Name, lostCurrencies);
            } else {
                Packets.dropletBurnt.toAllClients(droplet.Name, new Map());
            }
            const u = instanceInfo.Upgrades;
            if (u !== undefined) {
                for (const [id, upgrade] of u) {
                    upgrades.set(id, upgrade);
                }
            }

            check(true);
        });

        item.repeat(model, () => check(), 0.5);
    }

    static clientLoad(model: Model, condenser: Condenser) {
        const surfaceGui = model.WaitForChild("GuiPart").FindFirstChildOfClass("SurfaceGui");
        if (surfaceGui === undefined) {
            return;
        }
        const pricePerDroplet = Condenser.getPricePerDroplet(condenser);
        const update = (current: BaseCurrencyMap) => {
            pricePerDroplet.forEach((price) => {
                for (const [currency, amount] of pairs(price.amountPerCurrency)) {
                    const currentAmount = new OnoeNum(current.get(currency) ?? 0);
                    const progress = currentAmount.div(amount).revert();
                    const bar = surfaceGui.WaitForChild(currency + "Bar", 1);
                    if (bar === undefined) {
                        return;
                    }
                    (bar.WaitForChild("Fill") as Frame).Size = new UDim2(math.min(progress, 1), 0, 1, 0);
                    (bar.WaitForChild("PercentageLabel") as TextLabel).Text = math.floor(progress * 100) + "%";
                }
            });
        };
        update(new Map());
        storeChangedPacket.fromServer(model, update);
    }

    /**
     * Creates a new condenser.
     *
     * @param item The item to create the condenser from.
     */
    constructor(item: Item) {
        super(item);
        const furnace = item.trait(Furnace);
        const dropper = item.trait(Dropper);
        furnace.acceptsGlobalBoosts(false);
        furnace.setMul(CurrencyBundle.ones().mul(0));
        dropper.dropRate = 0;
        item.onLoad((model) => Condenser.load(model, this));
        item.onClientLoad((model) => Condenser.clientLoad(model, this));
    }

    /**
     * Sets the percentage of the original value required to produce one of the droplet.
     *
     * @param percentage The percentage of the original value required to produce one of the droplet.
     * @returns This condenser.
     */
    setQuota(percentage: number) {
        this.quota = percentage;
        return this;
    }

    addDroplets(...droplets: Droplet[]) {
        for (const droplet of droplets) {
            this.droplets.push(droplet);
            this.totalValue = this.totalValue.add(droplet.value);
        }
        return this;
    }

    format(str: string) {
        str = str.gsub("%%val%%", this.totalValue.toString(true))[0];
        return str.gsub("%%quota%%", `${this.quota * 100}%%`)[0];
    }
}
