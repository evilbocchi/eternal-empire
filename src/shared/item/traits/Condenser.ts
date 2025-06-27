import { OnoeNum } from "@antivivi/serikanum";
import { getAllInstanceInfo, setInstanceInfo } from "@antivivi/vrldk";
import { AREAS } from "shared/Area";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import Item from "shared/item/Item";
import { GameUtils } from "shared/item/ItemUtils";
import Dropper from "shared/item/traits/Dropper";
import Furnace from "shared/item/traits/Furnace";
import ItemTrait from "shared/item/traits/ItemTrait";
import Packets from "shared/Packets";
import Droplet from "../Droplet";

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

        OnProcessed?: (result: CurrencyBundle, raw: CurrencyBundle, droplet: BasePart) => void;
    }
}

/**
 * A condenser is an item that 'condenses' multiple droplets into a single droplet, usually of higher value.
 */
export default class Condenser extends ItemTrait {

    droplets = new Array<Droplet>();
    totalValue = new CurrencyBundle();

    quota = 1;

    static load(model: Model, condenser: Condenser) {
        const item = condenser.item;
        const dropper = item.trait(Dropper);
        const areaId = GameUtils.itemsService.getPlacedItem(model.Name)?.area;
        if (areaId === undefined)
            return;
        const area = AREAS[areaId as AreaId];
        const dropletLimit = area.dropletLimit;
        const dropletCountPerArea = GameUtils.dropletCountPerArea;
        const instantiatorsPerDroplet = new Map<Droplet, () => BasePart>();
        const pricePerDroplet = new Map<Droplet, CurrencyBundle>();
        const maxCosts = new Map<Currency, OnoeNum>();
        for (const droplet of condenser.droplets) {
            const value = droplet.value;
            if (value === undefined)
                continue;
            const price = value.mul(condenser.quota);
            pricePerDroplet.set(droplet, price);
            for (const [currency, amount] of price.amountPerCurrency) {
                maxCosts.set(currency, amount.mul(10));
            }
            const drop = model.WaitForChild("Drop") as BasePart;
            instantiatorsPerDroplet.set(droplet, Dropper.wrapInstantiator(droplet.getInstantiator(model, drop), dropper));
        }
        const surfaceGui = model.WaitForChild("GuiPart").FindFirstChildOfClass("SurfaceGui");
        const lava = model.WaitForChild("Lava");
        if (surfaceGui === undefined) {
            return;
        }
        let current = new CurrencyBundle();
        const upgrades = new Map<string, UpgradeInfo>();

        const check = () => {
            pricePerDroplet.forEach((price, droplet) => {
                const dropletCount = dropletCountPerArea.get(areaId as AreaId);
                if (dropletCount === undefined || dropletCount > dropletLimit.Value) {
                    return;
                }
                let dontResetUpgrades = false;
                for (const [currency, amount] of pairs(price.amountPerCurrency)) {
                    const currentCost = current.get(currency);
                    if (currentCost === undefined)
                        return;

                    const percentage = currentCost.div(amount);
                    if (percentage.lessThan(1)) {
                        return;
                    }
                    if (percentage.moreThan(1.15))
                        dontResetUpgrades = true;
                }

                current = current.sub(price);
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
                    if (!dontResetUpgrades)
                        upgrades.clear();
                    instanceInfo.Upgrades = replacingUpgrades;
                    instanceInfo.Condensed = true;
                }
            });
            update();
        };
        const update = () => {
            pricePerDroplet.forEach((price) => {
                for (const [currency, amount] of pairs(price.amountPerCurrency)) {
                    const progress = current.get(currency)?.div(amount).revert() ?? 0;
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
        setInstanceInfo(model, "OnProcessed", (result, raw, dropletModel) => {
            const instanceInfo = getAllInstanceInfo(dropletModel);
            if (instanceInfo.DropletId === undefined || instanceInfo.Condensed === true) {
                return;
            }

            const currentMap = current.amountPerCurrency;
            const lostValue = new Map<Currency, OnoeNum>();
            for (const [currency, amount] of raw.amountPerCurrency) {
                const prev = currentMap.get(currency);
                let newCost = prev === undefined ? amount : prev.add(amount);
                const limit = maxCosts.get(currency);
                if (limit === undefined) {
                    if (ZERO.lessThan(amount)) {
                        lostValue.set(currency, amount);
                    }
                }
                else {
                    currentMap.set(currency, OnoeNum.min(newCost, limit));
                }
            }

            if (!lostValue.isEmpty()) {
                const lostCurrencies = RevenueService.performSoftcaps(lostValue);
                CurrencyService.incrementAll(lostCurrencies);
                Packets.dropletBurnt.fireAll(dropletModel.Name, lostCurrencies);
            }
            const u = instanceInfo.Upgrades;
            if (u !== undefined) {
                for (const [id, upgrade] of u) {
                    upgrades.set(id, upgrade);
                }
            }

            check();
            update();

        });

        item.repeat(model, () => check(), 0.4);
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
        dropper.dropRate = 0;
        item.onLoad((model) => Condenser.load(model, this));
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
        const furnace = this.item.trait(Furnace);
        for (const droplet of droplets) {
            this.droplets.push(droplet);
            this.totalValue = this.totalValue.add(droplet.value);
        }
        for (const [currency, _] of pairs(CURRENCY_DETAILS)) {
            const inTotalValue = this.totalValue.get(currency);
            const isCondensed = inTotalValue !== undefined && inTotalValue.moreThan(0);
            furnace.setMul((furnace.mul ?? new CurrencyBundle()).set(currency, isCondensed ? 0 : 1));
        }
        return this;
    }

    format(str: string) {
        str = str.gsub("%%val%%", this.totalValue.toString(true))[0];
        return str.gsub("%%quota%%", `${this.quota * 100}%%`)[0];
    }
}