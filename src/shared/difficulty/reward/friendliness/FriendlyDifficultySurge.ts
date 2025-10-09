import Difficulty from "@rbxts/ejt";
import { getAsset } from "shared/asset/AssetMap";
import DifficultyReward from "shared/difficulty/reward/DifficultyReward";

export = new DifficultyReward(script.Name, Difficulty.Friendliness)
    .setTitle("Friendly Difficulty Surge")
    .setDescription("Immediately receive 15 seconds worth of Difficulty Power.")
    .setIcon(getAsset("assets/DifficultyPower.png"))
    .setCooldownSeconds(45)
    .setPrice({
        kind: "percentageOfDifficultyPower",
        percentage: 0,
    })
    .addEffect({
        kind: "redeemRevenue",
        seconds: 15,
        currencies: ["Difficulty Power"],
    });
