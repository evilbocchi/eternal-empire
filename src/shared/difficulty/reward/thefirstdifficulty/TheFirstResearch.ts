import Difficulty from "@rbxts/ejt";
import { OnoeNum } from "@rbxts/serikanum";
import { getAsset } from "shared/asset/AssetMap";
import DifficultyReward from "shared/difficulty/reward/DifficultyReward";

export = new DifficultyReward(script.Name, Difficulty.TheFirstDifficulty)
    .setTitle("The First Research")
    .setDescription("Increase Difficulty Power gain by 1 in exchange for 5% of your current Difficulty Power.")
    .setIcon(getAsset("assets/DifficultyPower.png"))
    .setCooldownSeconds(5)
    .setPrice({
        kind: "percentageOfDifficultyPower",
        percentage: 0.05,
        minimum: new OnoeNum(10),
    })
    .addEffect({
        kind: "increaseDifficultyPower",
        add: new OnoeNum(1),
    });
