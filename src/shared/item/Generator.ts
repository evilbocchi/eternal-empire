import Price from "shared/Price";
import Item from "shared/item/Item";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";
import { GameUtils } from "shared/utils/ItemUtils";

declare global {
    interface ItemTypes {
        Generator: Generator;
    }
}

const GENERATOR_UPGRADES = NamedUpgrades.getUpgrades("Generator");

class Generator extends Item {

    passiveGain: Price | undefined;

    constructor(id: string) {
        super(id);
        this.types.add("Generator");
        this.onLoad((model) => {
            const remoteEvent = new Instance("UnreliableRemoteEvent", model);
            const boostsFolder = new Instance("Folder");
            boostsFolder.Name = "Boosts";
            boostsFolder.Parent = model;

            const RevenueService = GameUtils.revenueService;
            const Items = GameUtils.items;
            let t = 0;
            this.repeat(model, (dt) => {
                t += dt;
                if (t < 0.5)
                    return;

                const passiveGain = this.passiveGain;
                if (passiveGain !== undefined) {
                    let value = passiveGain.mul(t);
                    let totalAdd = Price.EMPTY_PRICE;
                    let totalMul = Price.ONES;
                    let totalPow = Price.ONES;

                    const boosted = new Set<string>();
                    for (const boolValue of boostsFolder.GetChildren()) {
                        const placedItem = GameUtils.itemsService.getPlacedItem(boolValue.Name);
                        if (placedItem === undefined) {
                            boolValue.Destroy();
                            continue;
                        }

                        const check = placedItem.placementId;
                        if (boosted.has(check))
                            continue;
                        boosted.add(check);
                        const item = Items.getItem(placedItem.item);
                        if (item === undefined || !item.isA("Charger"))
                            continue;

                        if (item.mul !== undefined)
                            totalMul = totalMul.mul(item.mul);
                        if (item.pow !== undefined)
                            totalPow = totalPow.mul(item.pow);
                    }
                    const boost = model.GetAttribute("GeneratorBoost") as number | undefined;
                    if (boost !== undefined) {
                        totalMul = totalMul.mul(boost);
                    }

                    [totalAdd, totalMul, totalPow] = RevenueService.applyGlobal(totalAdd, totalMul, totalPow, GENERATOR_UPGRADES);                    
                    const worth = RevenueService.coalesce(value, totalAdd, totalMul, totalPow);
                    const costPerCurrency = RevenueService.applySoftcaps(worth.costPerCurrency);
                    remoteEvent.FireAllClients(costPerCurrency);
                    GameUtils.currencyService.incrementCurrencies(costPerCurrency);
                }
                t = 0;
            });
        });
    }

    setPassiveGain(passiveGain: Price) {
        this.passiveGain = passiveGain;
        return this;
    }
}

export = Generator;