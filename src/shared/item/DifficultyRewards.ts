import Difficulty from "@rbxts/ejt";
import { getAsset } from "shared/asset/AssetMap";

export type DifficultyRewardId = "CandyCoatedConsultation" | "GapMomentum" | "NegativityNanobot";

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

export type DifficultyRewardEffect = CandyOfflineRevenueEffect | WalkSpeedBuffEffect | GrantItemEffect;

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

definitions.push({
    id: "GapMomentum",
    difficultyId: Difficulty.TheLowerGap.id,
    title: "Gap Momentum",
    description: "Gain +2 WalkSpeed for one minute to sprint through The Lower Gap.",
    icon: getAsset("assets/Speed.png"),
    cooldownSeconds: 80,
    cost: {
        kind: "percentageOfDifficultyPower",
        percentage: 0,
    },
    effect: {
        kind: "walkSpeedBuff",
        amount: 2,
        durationSeconds: 60,
    },
});

definitions.push({
    id: "NegativityNanobot",
    difficultyId: Difficulty.Negativity.id,
    title: "Nanobot Redeemer",
    description: "Redeem 75% of your Difficulty Power (minimum 1,000) for a Basic Nanobot to deploy.",
    icon: getAsset("assets/PortableBeacon.png"),
    cooldownSeconds: 5 * 60,
    cost: {
        kind: "percentageOfDifficultyPower",
        percentage: 0.75,
        minimum: 1_000,
    },
    effect: {
        kind: "grantItem",
        itemId: "BasicNanobot",
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
