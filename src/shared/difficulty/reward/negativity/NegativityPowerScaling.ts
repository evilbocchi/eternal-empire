import Difficulty from "@rbxts/ejt";
import { OnoeNum } from "@rbxts/serikanum";
import { getAsset } from "shared/asset/AssetMap";
import Formula from "shared/currency/Formula";
import DifficultyReward from "shared/difficulty/reward/DifficultyReward";

export = new DifficultyReward(script.Name, Difficulty.Negativity)
    .setTitle("Negativity Power Scaling")
    .setDescription(
        "Claim a multiplicative boost to Difficulty Power that scales with your current Difficulty Power (capped at 10000).",
    )
    .setIcon(getAsset("assets/DifficultyPower.png"))
    .setCooldownSeconds(0)
    .setMaxClaims(1)
    .setLayoutOrder(2)
    .setPrice({
        kind: "flatDifficultyPower",
        amount: new OnoeNum(2500),
    })
    .addEffect({
        kind: "increaseDifficultyPowerFormula",
        formula: new Formula().add(1).log(5).add(1),
        x: "difficultyPower",
        xCap: new OnoeNum(10000),
    });
