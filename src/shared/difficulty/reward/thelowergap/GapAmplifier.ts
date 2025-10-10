import Difficulty from "@rbxts/ejt";
import { OnoeNum } from "@rbxts/serikanum";
import { getAsset } from "shared/asset/AssetMap";
import DifficultyReward from "shared/difficulty/reward/DifficultyReward";

export = new DifficultyReward(script.Name, Difficulty.TheLowerGap)
    .setTitle("Gap Amplifier")
    .setDescription("Claim a permanent x3 Difficulty Power multiplier. Can only be taken once.")
    .setIcon(getAsset("assets/DifficultyPower.png"))
    .setCooldownSeconds(0)
    .setMaxClaims(1)
    .setLayoutOrder(4)
    .setPrice({
        kind: "flatDifficultyPower",
        amount: new OnoeNum(500),
    })
    .addEffect({
        kind: "increaseDifficultyPower",
        mul: new OnoeNum(3),
    });
