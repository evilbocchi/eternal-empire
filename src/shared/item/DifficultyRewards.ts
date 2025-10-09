import Difficulty from "@rbxts/ejt";
import { getAsset } from "shared/asset/AssetMap";

export type DifficultyRewardId = "CandyCoatedConsultation";

export type DifficultyRewardCost = PercentageOfDifficultyPowerCost;

export interface PercentageOfDifficultyPowerCost {
    kind: "percentageOfDifficultyPower";
    percentage: number;
    minimum?: number;
}

export interface CandyOfflineRevenueEffect {
    kind: "candyOfflineRevenue";
    itemId: string;
    revenueSeconds: number;
}

export type DifficultyRewardEffect = CandyOfflineRevenueEffect;

export interface DifficultyRewardDefinition {
    id: DifficultyRewardId;
    difficultyId: string;
    title: string;
    description: string;
    icon: string;
    cooldownSeconds: number;
    cost: DifficultyRewardCost;
    effect: DifficultyRewardEffect;
}

const definitions = new Array<DifficultyRewardDefinition>();

definitions.push({
    id: "CandyCoatedConsultation",
    difficultyId: Difficulty.TheFirstDifficulty.id,
    title: "Candy Consultation",
    description:
        "Trade a portion of your Difficulty Power for a kit that redeems 30 seconds of offline revenue when used.",
    icon: getAsset("assets/CandyResearchKit.png"),
    cooldownSeconds: 60,
    cost: {
        kind: "percentageOfDifficultyPower",
        percentage: 0.5,
    },
    effect: {
        kind: "candyOfflineRevenue",
        itemId: "CandyResearchKit",
        revenueSeconds: 30,
    },
});

const perDifficulty = new Map<string, DifficultyRewardDefinition[]>();
const byId = new Map<DifficultyRewardId, DifficultyRewardDefinition>();

for (const definition of definitions) {
    let bucket = perDifficulty.get(definition.difficultyId);
    if (bucket === undefined) {
        bucket = new Array<DifficultyRewardDefinition>();
        perDifficulty.set(definition.difficultyId, bucket);
    }
    bucket.push(definition);
    byId.set(definition.id, definition);
}

for (const [, bucket] of perDifficulty) {
    bucket.sort((a, b) => a.title < b.title);
}

export function getDifficultyRewards(difficulty: Difficulty | undefined) {
    if (difficulty === undefined) {
        return new Array<DifficultyRewardDefinition>();
    }
    const bucket = perDifficulty.get(difficulty.id);
    return bucket !== undefined ? bucket : new Array<DifficultyRewardDefinition>();
}

export function getDifficultyRewardById(id: string) {
    return byId.get(id as DifficultyRewardId);
}

export const DifficultyRewards = {
    all: definitions,
    perDifficulty,
    byId,
};
