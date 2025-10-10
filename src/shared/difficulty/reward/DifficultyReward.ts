import { combineHumanReadable } from "@antivivi/vrldk";
import Difficulty from "@rbxts/ejt";
import { OnoeNum } from "@rbxts/serikanum";
import { Server } from "shared/api/APIExpose";
import { Identifiable, ModuleRegistry } from "shared/hamster/ModuleRegistry";
import Formula from "shared/currency/Formula";

export type DifficultyRewardPrice = FlatDifficultyPowerCost | PercentageOfDifficultyPowerPrice;

export interface FlatDifficultyPowerCost {
    kind: "flatDifficultyPower";
    amount: OnoeNum;
}

export interface PercentageOfDifficultyPowerPrice {
    kind: "percentageOfDifficultyPower";
    percentage: number;
    minimum?: OnoeNum;
}

export interface WalkSpeedBuffEffect {
    kind: "walkSpeedBuff";
    amount: number;
    durationSeconds: number;
}

export interface GrantItemEffect {
    kind: "grantItem";
    itemId: string;
    amount?: number;
}

export interface RedeemRevenueEffect {
    kind: "redeemRevenue";
    seconds: number;
    currencies: Currency[];
}

export interface IncreaseDifficultyPowerEffect {
    kind: "increaseDifficultyPower";
    add?: OnoeNum;
    mul?: OnoeNum;
}

export interface IncreaseDifficultyPowerFormulaEffect {
    kind: "increaseDifficultyPowerFormula";
    formula: Formula;
    x: string;
    xCap?: OnoeNum;
}

export type DifficultyRewardEffect =
    | WalkSpeedBuffEffect
    | GrantItemEffect
    | RedeemRevenueEffect
    | IncreaseDifficultyPowerEffect
    | IncreaseDifficultyPowerFormulaEffect;

export default class DifficultyReward extends Identifiable {
    static readonly REGISTRY = new ModuleRegistry<DifficultyReward>(script.Parent!, new Set([script]));

    title?: string;
    description?: string;
    icon?: string;
    viewportItemId?: string;
    cooldownSeconds?: number;
    price?: DifficultyRewardPrice;
    readonly effects = new Set<DifficultyRewardEffect>();
    maxClaims?: number;
    layoutOrder = 0;

    constructor(
        readonly id: string,
        readonly difficulty: Difficulty,
    ) {
        super(id);
    }

    setTitle(title: string) {
        this.title = title;
        return this;
    }

    setDescription(description: string) {
        this.description = description;
        return this;
    }

    setIcon(icon: string) {
        this.icon = icon;
        return this;
    }

    setViewportItemId(viewportItemId: string) {
        this.viewportItemId = viewportItemId;
        return this;
    }

    setCooldownSeconds(cooldownSeconds: number) {
        this.cooldownSeconds = cooldownSeconds;
        return this;
    }

    setPrice(price: DifficultyRewardPrice) {
        this.price = price;
        return this;
    }

    addEffect(effect: DifficultyRewardEffect) {
        this.effects.add(effect);
        return this;
    }

    setMaxClaims(maxClaims: number) {
        this.maxClaims = maxClaims;
        return this;
    }

    setLayoutOrder(layoutOrder: number) {
        this.layoutOrder = layoutOrder;
        return this;
    }

    override init() {
        return () => {};
    }

    getPriceLabel(currentDifficultyPower: OnoeNum) {
        if (this.price === undefined) {
            return $tuple("Free!", new OnoeNum(0));
        }

        if (this.price.kind === "percentageOfDifficultyPower") {
            let cost = currentDifficultyPower.mul(new OnoeNum(this.price.percentage));
            if (this.price.minimum !== undefined) {
                const minimum = new OnoeNum(this.price.minimum);
                if (cost.lessThan(minimum)) {
                    cost = minimum;
                }
            }
            if (cost.lessEquals(0)) {
                return $tuple("Free!", cost);
            }

            return $tuple(
                `${math.floor(this.price.percentage * 100 * 100) / 100}% of your Difficulty Power (${OnoeNum.toString(cost)})`,
                cost,
            );
        }
        return $tuple("Free!", new OnoeNum(0));
    }

    static getEffectLabel(effect: DifficultyRewardEffect) {
        switch (effect.kind) {
            case "walkSpeedBuff": {
                const durationText = this.formatDurationShort(effect.durationSeconds);
                return `Effect: +${effect.amount} walkspeed for ${durationText}.`;
            }
            case "grantItem": {
                const amount = effect.amount ?? 1;
                const item = Server.Items.itemsPerId.get(effect.itemId);
                const itemName = item?.name ?? effect.itemId;
                return `Reward: ${itemName} x${amount}.`;
            }
            case "redeemRevenue": {
                const durationText = this.formatDurationShort(effect.seconds);
                const currencies = combineHumanReadable(...effect.currencies);
                return `Reward: Redeem ${durationText} of ${currencies}.`;
            }
            case "increaseDifficultyPower": {
                const operationLabels = new Array<string>();
                if (effect.add !== undefined && effect.add.moreThan(0)) {
                    operationLabels.push(`+${OnoeNum.toString(effect.add)}`);
                }
                if (effect.mul !== undefined && effect.mul.moreThan(0)) {
                    operationLabels.push(`x${OnoeNum.toString(effect.mul)}`);
                }
                const combined = combineHumanReadable(...operationLabels);

                return `Reward: ${combined} Difficulty Power per furnace process.`;
            }
            case "increaseDifficultyPowerFormula": {
                const formulaString = effect.formula.tostring(effect.x);
                return `Reward: Multiply Difficulty Power by ${formulaString} per furnace process.`;
            }
            default:
                return "Unknown effect";
        }
    }

    getEffectsLabel() {
        const labels = new Array<string>();
        this.effects.forEach((effect) => {
            labels.push(DifficultyReward.getEffectLabel(effect));
        });
        return labels.join("\n");
    }

    static formatDurationShort(seconds: number) {
        if (seconds <= 0) return "0s";
        const rounded = math.floor(seconds);
        const minutes = math.floor(rounded / 60);
        const remainder = rounded % 60;
        if (minutes > 0) {
            return `${minutes}m ${remainder}s`;
        }
        return `${remainder}s`;
    }

    /**
     * Sets up the difficulty rewards registry and provides utility functions to access them.
     */
    static setupDifficultyRewards() {
        const perDifficulty = new Map<string, DifficultyReward[]>();
        const byId = new Map<string, DifficultyReward>();

        const definitions = this.REGISTRY.load();
        for (const [id, definition] of definitions) {
            let bucket = perDifficulty.get(definition.difficulty.id);
            if (bucket === undefined) {
                bucket = new Array<DifficultyReward>();
                perDifficulty.set(definition.difficulty.id, bucket);
            }
            bucket.push(definition);
            byId.set(id, definition);
        }

        for (const [, bucket] of perDifficulty) {
            bucket.sort((a, b) => a.layoutOrder < b.layoutOrder);
        }

        function getDifficultyRewards(difficulty: Difficulty | undefined) {
            if (difficulty === undefined) {
                return new Array<DifficultyReward>();
            }
            const bucket = perDifficulty.get(difficulty.id);
            return bucket !== undefined ? bucket : new Array<DifficultyReward>();
        }

        function getDifficultyRewardById(id: string) {
            return byId.get(id);
        }

        return {
            all: definitions,
            perDifficulty,
            byId,
            getDifficultyRewards,
            getDifficultyRewardById,
        };
    }
}
