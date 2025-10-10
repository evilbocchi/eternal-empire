import Difficulty from "@rbxts/ejt";
import { OnoeNum } from "@rbxts/serikanum";
import { getAsset } from "shared/asset/AssetMap";
import DifficultyReward from "shared/difficulty/reward/DifficultyReward";

export = new DifficultyReward(script.Name, Difficulty.TheLowerGap)
    .setTitle("Gap Power Surge")
    .setDescription("Claim a permanent +25 Difficulty Power bonus per furnace process.")
    .setIcon(getAsset("assets/DifficultyPower.png"))
    .setCooldownSeconds(0)
    .setMaxClaims(2)
    .setLayoutOrder(3)
    .setPrice({
        kind: "flatDifficultyPower",
        amount: new OnoeNum(300),
    })
    .addEffect({
        kind: "increaseDifficultyPower",
        add: new OnoeNum(25),
    });
