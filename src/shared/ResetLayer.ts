import { OnoeNum } from "@antivivi/serikanum";
import { AREAS } from "shared/Area";
import Formula from "shared/currency/Formula";

declare global {
    type ResetLayerId = keyof (typeof RESET_LAYERS);
    type ResetLayer = (typeof RESET_LAYERS)[ResetLayerId];
}

export const RESET_LAYERS = {
    Skillification: {
        order: 1,
        area: AREAS.BarrenIslands,
        formula: new Formula().add(1).div(1e+12).log(16).pow(1.8).add(1),
        minimum: new OnoeNum(1e+12),
        scalesWith: "Power" as Currency,
        gives: "Skill" as Currency,
        resettingCurrencies: ["Funds", "Power", "Purifier Clicks"] as Currency[],
        resettingUpgrades: ["MoreFunds", "MorePower"],
        badgeId: 1485187140296844,

        gainLabel: AREAS.SlamoVillage.areaFolder.FindFirstChild("SkillifyBoard")?.FindFirstChild("SurfaceGui")?.FindFirstChild("DifficultyLabel")?.FindFirstChild("Frame")?.FindFirstChild("GainLabel") as TextLabel,
        touchPart: AREAS.SlamoVillage.areaFolder.FindFirstChild("Skillification") as BasePart & {
            BillboardGui: BillboardGui & {
                TextLabel: TextLabel;
            };
        },
        tpLocation: AREAS.BarrenIslands.getSpawnLocation(),
    }
};