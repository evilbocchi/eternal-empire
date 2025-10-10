import Difficulty from "@rbxts/ejt";
import { OnoeNum } from "@rbxts/serikanum";
import { getAsset } from "shared/asset/AssetMap";
import Formula from "shared/currency/Formula";
import DifficultyReward from "shared/difficulty/reward/DifficultyReward";

export = new DifficultyReward(script.Name, Difficulty.TheLowerGap)
    .setTitle("Gap Time Investment")
    .setDescription("Claim a multiplicative boost to Difficulty Power that scales with playtime (up to 1000 seconds).")
    .setIcon(getAsset("assets/DifficultyPower.png"))
    .setCooldownSeconds(0)
    .setMaxClaims(1)
    .setLayoutOrder(2)
    .setPrice({
        kind: "flatDifficultyPower",
        amount: new OnoeNum(200),
    })
    .addEffect({
        kind: "increaseDifficultyPowerFormula",
        formula: new Formula().add(1).log(10).add(1),
        x: "playtime",
        xCap: new OnoeNum(1000),
    });
