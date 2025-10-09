import Difficulty from "@rbxts/ejt";
import { OnoeNum } from "@rbxts/serikanum";
import { getAsset } from "shared/asset/AssetMap";

export type DifficultyRewardCost = PercentageOfDifficultyPowerCost;

export interface PercentageOfDifficultyPowerCost {
    kind: "percentageOfDifficultyPower";
    percentage: number;
    minimum?: number;
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

export interface IncreaseDifficultyPowerAddEffect {
    kind: "increaseDifficultyPowerAdd";
    amount: OnoeNum;
}

export interface IncreaseDifficultyPowerMulEffect {
    kind: "increaseDifficultyPowerMul";
    amount: OnoeNum;
}

export type DifficultyRewardEffect =
    | WalkSpeedBuffEffect
    | GrantItemEffect
    | RedeemRevenueEffect
    | IncreaseDifficultyPowerAddEffect
    | IncreaseDifficultyPowerMulEffect;

export interface DifficultyRewardDefinition {
    id: string;
    difficultyId: string;
    title: string;
    description: string;
    icon: string;
    viewportItemId?: string;
    cooldownSeconds: number;
    cost: DifficultyRewardCost;
    effect: DifficultyRewardEffect;
    maxClaims?: number;
}

const definitions = new Array<DifficultyRewardDefinition>();

definitions.push({
    id: "TheFirstResearch",
    difficultyId: Difficulty.TheFirstDifficulty.id,
    title: "The First Research",
    description: "In exchange for 5% of your current Difficulty Power, increase Difficulty Power gain by 1.",
    icon: getAsset("assets/DifficultyPower.png"),
    cooldownSeconds: 5,
    cost: {
        kind: "percentageOfDifficultyPower",
        percentage: 0.05,
        minimum: 10,
    },
    effect: {
        kind: "increaseDifficultyPowerAdd",
        amount: new OnoeNum(1),
    },
});

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
        minimum: 1,
    },
    effect: {
        kind: "grantItem",
        itemId: "CandyResearchKit",
        amount: 1,
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
    id: "GapResearchRush",
    difficultyId: Difficulty.TheLowerGap.id,
    title: "Gap Research Rush",
    description: "Claim a permanent x2 Difficulty Power research boost. This reward can only be taken twice.",
    icon: getAsset("assets/DifficultyPower.png"),
    cooldownSeconds: 0,
    cost: {
        kind: "percentageOfDifficultyPower",
        percentage: 0,
        minimum: 100,
    },
    effect: {
        kind: "increaseDifficultyPowerMul",
        amount: new OnoeNum(2),
    },
    maxClaims: 2,
});

definitions.push({
    id: "NegativityNanobot",
    difficultyId: Difficulty.Negativity.id,
    title: "Nanobot Redeemer",
    description: "Redeem a Basic Nanobot to automatically repair your items.",
    icon: getAsset("assets/PortableBeacon.png"),
    viewportItemId: "BasicNanobot",
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

definitions.push({
    id: "UnimpossibleExcavationStone",
    difficultyId: Difficulty.Unimpossible.id,
    title: "Excavation Stockpile",
    description: "Synthesize a Stone every minute to fuel your digs.",
    icon: getAsset("assets/MiscellaneousDifficulty.png"),
    viewportItemId: "ExcavationStone",
    cooldownSeconds: 60,
    cost: {
        kind: "percentageOfDifficultyPower",
        percentage: 0,
    },
    effect: {
        kind: "grantItem",
        itemId: "ExcavationStone",
    },
});

definitions.push({
    id: "FriendlyDifficultySurge",
    difficultyId: Difficulty.Friendliness.id,
    title: "Friendly Difficulty Surge",
    description: "Immediately receive 15 seconds worth of Difficulty Power.",
    icon: getAsset("assets/DifficultyPower.png"),
    cooldownSeconds: 45,
    cost: {
        kind: "percentageOfDifficultyPower",
        percentage: 0,
    },
    effect: {
        kind: "redeemRevenue",
        seconds: 15,
        currencies: ["Difficulty Power"],
    },
});

definitions.push({
    id: "EasefulIgnition",
    difficultyId: Difficulty.TrueEase.id,
    title: "Easeful Ignition",
    description: "Permanently increase furnace Difficulty Power gain by 1000 whenever a droplet is processed.",
    icon: getAsset("assets/DifficultyPower.png"),
    cooldownSeconds: 60,
    cost: {
        kind: "percentageOfDifficultyPower",
        percentage: 0,
    },
    effect: {
        kind: "increaseDifficultyPowerAdd",
        amount: new OnoeNum(1000),
    },
});

definitions.push({
    id: "GemsForAll",
    difficultyId: Difficulty.A.id,
    title: "Gems for All",
    description: "Redeem 1 White Gem every 5 minutes at no cost.",
    icon: getAsset("assets/MiscellaneousDifficulty.png"),
    viewportItemId: "WhiteGem",
    cooldownSeconds: 5 * 60,
    cost: {
        kind: "percentageOfDifficultyPower",
        percentage: 0,
    },
    effect: {
        kind: "grantItem",
        itemId: "WhiteGem",
        amount: 1,
    },
});

const perDifficulty = new Map<string, DifficultyRewardDefinition[]>();
const byId = new Map<string, DifficultyRewardDefinition>();

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
    return byId.get(id);
}

export const DifficultyRewards = {
    all: definitions,
    perDifficulty,
    byId,
};
