import Difficulty from "@rbxts/ejt";
import { OnoeNum } from "@rbxts/serikanum";
import { getAsset } from "shared/asset/AssetMap";
import DifficultyReward from "shared/difficulty/reward/DifficultyReward";

export = new DifficultyReward(script.Name, Difficulty.Negativity)
    .setTitle("Negativity Mega Boost")
    .setDescription("Claim a permanent +100 Difficulty Power bonus per furnace process.")
    .setIcon(getAsset("assets/DifficultyPower.png"))
    .setCooldownSeconds(0)
    .setMaxClaims(1)
    .setLayoutOrder(3)
    .setPrice({
        kind: "flatDifficultyPower",
        amount: new OnoeNum(3000),
    })
    .addEffect({
        kind: "increaseDifficultyPower",
        add: new OnoeNum(100),
    });
