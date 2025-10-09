import Difficulty from "@rbxts/ejt";
import { getAsset } from "shared/asset/AssetMap";
import DifficultyReward from "shared/difficulty/reward/DifficultyReward";

export = new DifficultyReward(script.Name, Difficulty.TheLowerGap)
    .setTitle("Gap Momentum")
    .setDescription("Gain +2 walkspeed for one minute to sprint through The Lower Gap at no cost.")
    .setIcon(getAsset("assets/Speed.png"))
    .setCooldownSeconds(80)
    .setPrice({
        kind: "percentageOfDifficultyPower",
        percentage: 0,
    })
    .addEffect({
        kind: "walkSpeedBuff",
        amount: 2,
        durationSeconds: 60,
    });
