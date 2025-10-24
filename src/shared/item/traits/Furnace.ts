//!native
//!optimize 2
import { findBaseParts, getAllInstanceInfo } from "@antivivi/vrldk";
import { OnoeNum } from "@rbxts/serikanum";
import { Debris } from "@rbxts/services";
import { Server } from "shared/api/APIExpose";
import { IS_EDIT } from "shared/Context";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Operative from "shared/item/traits/Operative";
import isPlacedItemUnusable from "shared/item/utils/isPlacedItemUnusable";
import { VirtualCollision } from "shared/item/utils/VirtualReplication";
import Packets from "shared/Packets";

declare global {
    interface ItemTraits {
        Furnace: Furnace;
    }
    interface InstanceInfo {
        /**
         * Whether this droplet has already been incinerated by a furnace.
         */
        incinerated?: boolean;

        /**
         * Fired when a droplet is processed by this furnace model.
         * If this is not defined, the default packet {@link Packets.dropletBurnt} will be sent to all clients instead.
         * @param result The resulting value gained from processing the droplet.
         * @param droplet The droplet being processed.
         * @param dropletInfo The instance info of the droplet being processed.
         */
        furnaceProcessed?: (result: CurrencyBundle, droplet: BasePart, dropletInfo: InstanceInfo) => void;
    }

    interface ItemBoost {
        furnaceMul?: number;
    }
}

const ZERO = new OnoeNum(0);

export default class Furnace extends Operative {
    static load(model: Model, furnace: Furnace) {
        const modelInfo = getAllInstanceInfo(model);
        const item = furnace.item;

        for (const lava of findBaseParts(model, "Lava")) {
            const lavaInfo = getAllInstanceInfo(lava);
            lavaInfo.itemId = item.id;

            VirtualCollision.onDropletTouched(model, lava, (dropletModel, dropletInfo) => {
                if (dropletInfo.incinerated === true) return;

                const modelArea = modelInfo.area;
                if (modelArea === undefined) {
                    if (!IS_EDIT) throw `Furnace model ${model.GetFullName()} is missing Area info`;
                } else if (modelArea !== dropletInfo.area && dropletInfo.lastTeleport === undefined) {
                    // Sanity check: droplet should be in the same area as the furnace unless it was teleported
                    return;
                }

                if (isPlacedItemUnusable(modelInfo)) return;

                dropletInfo.incinerated = true;
                Debris.AddItem(dropletModel, 6);

                const result = Server.Revenue.calculateDropletValue(dropletModel);
                if (furnace.isCauldron) {
                    result.markAsCauldron();
                }

                // Upgrader boosts, lightning surge, etc.
                result.applySource();

                // Furnace
                if (furnace.isCalculatesFurnace === true) {
                    result.applyOperative(furnace);

                    const boosts = modelInfo.boosts;
                    if (boosts !== undefined) {
                        for (const [_, boost] of boosts) {
                            const mul = boost.furnaceMul;
                            if (mul === undefined) continue;
                            result.applyConstant(mul, "mul");
                        }
                    }

                    // Furnace variance
                    const varianceResult = furnace.varianceResult;
                    if (varianceResult !== undefined) {
                        result.applyConstant(varianceResult, "mul");
                    }
                }

                // Dark Matter, Bombs, etc.
                if (furnace.isCalculatesFinal === true) {
                    result.applyFinal();
                }

                const final = result.coalesce();
                const finalAmountPerCurrency = final.amountPerCurrency;

                for (const [currency, amount] of finalAmountPerCurrency) {
                    if (amount.equals(ZERO)) finalAmountPerCurrency.delete(currency);
                }

                // Grant currencies
                if (furnace.isCalculatesFurnace === true) {
                    Server.Currency.incrementAll(finalAmountPerCurrency);
                }

                const furnaceProcessed = modelInfo.furnaceProcessed;
                if (furnaceProcessed !== undefined) {
                    furnaceProcessed(final, dropletModel, dropletInfo);
                } else {
                    Packets.dropletBurnt.toAllClients(dropletModel.Name, finalAmountPerCurrency);
                }
            });
        }
        item.maintain(model);
    }

    variance?: number;
    varianceResult?: number;

    isCalculatesFurnace = true;
    isCalculatesFinal = true;
    isCauldron = false;

    constructor(item: Item) {
        super(item);
        item.onInit(() => {
            if (this.variance === undefined) return;

            item.repeat(
                undefined,
                () => {
                    const variance = this.variance;
                    if (variance === undefined) return;
                    this.varianceResult = math.random() * variance + 1 - variance * 0.5;
                },
                0.7,
            );
        });
        item.onLoad((model) => Furnace.load(model, this));
    }

    /**
     * Sets the factor of random variance applied to droplet values when processed by this furnace.
     * @param variance The variance factor (0 = no variance, 1 = ±50% variance, 2 = ±100% variance).
     * @returns The furnace trait.
     */
    setVariance(variance: number) {
        if (variance > 2) throw `Furnace variance cannot be greater than 2 (received ${variance})`;
        if (variance < 0) throw `Furnace variance cannot be less than 0 (received ${variance})`;

        this.variance = variance;
        return this;
    }

    /**
     * Whether the furnace will process its boost and grant currencies.
     * @param includesFurnace Whether to include furnace boosts and currency grants.
     * @returns The furnace trait.
     */
    calculatesFurnace(includesFurnace: boolean) {
        this.isCalculatesFurnace = includesFurnace;
        return this;
    }

    /**
     * Whether the furnace will process final boosts such as Dark Matter and Bombs.
     * @param includesFinalBoosts Whether to include final boosts.
     * @returns The furnace trait.
     */
    calculatesFinal(includesFinalBoosts: boolean) {
        this.isCalculatesFinal = includesFinalBoosts;
        return this;
    }

    /**
     * Whether this furnace is a cauldron, disabling upgrader boosts if processed droplets are not sky droplets.
     * @param isCauldron Whether this furnace is a cauldron.
     * @returns The furnace trait.
     */
    setIsCauldron(isCauldron: boolean) {
        this.isCauldron = isCauldron;
        return this;
    }
}
