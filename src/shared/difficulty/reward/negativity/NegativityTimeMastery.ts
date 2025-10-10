import Difficulty from "@rbxts/ejt";
import { OnoeNum } from "@rbxts/serikanum";
import { getAsset } from "shared/asset/AssetMap";
import Formula from "shared/currency/Formula";
import DifficultyReward from "shared/difficulty/reward/DifficultyReward";

export = new DifficultyReward(script.Name, Difficulty.Negativity)
    .setTitle("Negativity Time Mastery")
    .setDescription(
        "Claim a multiplicative boost to Difficulty Power that scales with extended playtime (up to 10000 seconds).",
    )
    .setIcon(getAsset("assets/DifficultyPower.png"))
    .setCooldownSeconds(0)
    .setMaxClaims(1)
    .setLayoutOrder(5)
    .setPrice({
        kind: "flatDifficultyPower",
        amount: new OnoeNum(4000),
    })
    .addEffect({
        kind: "increaseDifficultyPowerFormula",
        formula: new Formula().add(10).log(8).add(1),
        x: "playtime",
        xCap: new OnoeNum(10000),
    });
