import { OnoeNum } from "@antivivi/serikanum";
import Formula from "shared/currency/Formula";

declare global {
    type ResetLayerId = keyof typeof RESET_LAYERS;
    type ResetLayer = (typeof RESET_LAYERS)[ResetLayerId];
}

export const RESET_LAYERS = {
    Skillification: {
        order: 1,
        area: "BarrenIslands" as AreaId,
        formula: new Formula().add(1).div(1e12).log(16).pow(1.8).add(1),
        minimum: new OnoeNum(1e12),
        scalesWith: "Power" as Currency,
        gives: "Skill" as Currency,
        resettingCurrencies: ["Funds", "Power", "Purifier Clicks"] as Currency[],
        resettingUpgrades: ["MoreFunds", "MorePower"],
        badgeId: 1485187140296844, // TODO: change badge
    },
    Winification: {
        order: 2,
        area: "SlamoVillage" as AreaId,
        formula: new Formula().add(1).div(1e12).log(18).pow(1.7).add(1),
        minimum: new OnoeNum(1e12),
        scalesWith: "Skill" as Currency,
        gives: "Wins" as Currency,
        resettingCurrencies: ["Skill", "Bitcoin", "Dark Matter"] as Currency[],
        resettingUpgrades: [
            "CryptographicFunds",
            "CryptographicPower",
            "SkilledMining",
            "ArtOfPurification",
            "DarkerMatter",
            "EfficientLearning",
        ],
        badgeId: 645025346348557, // TODO: change badge
    },
};
