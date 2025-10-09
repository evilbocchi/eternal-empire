import Difficulty from "@rbxts/ejt";
import { OnoeNum } from "@rbxts/serikanum";
import { getAsset } from "shared/asset/AssetMap";
import DifficultyReward from "shared/difficulty/reward/DifficultyReward";

export = new DifficultyReward(script.Name, Difficulty.TheLowerGap)
    .setTitle("Gap Research Rush")
    .setDescription("Claim a permanent x2 Difficulty Power research boost. This reward can only be taken twice.")
    .setIcon(getAsset("assets/DifficultyPower.png"))
    .setCooldownSeconds(0)
    .setMaxClaims(2)
    .setPrice({
        kind: "flatDifficultyPower",
        amount: new OnoeNum(100),
    })
    .addEffect({
        kind: "increaseDifficultyPower",
        mul: new OnoeNum(2),
    });
