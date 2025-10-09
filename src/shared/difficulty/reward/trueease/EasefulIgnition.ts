import Difficulty from "@rbxts/ejt";
import { OnoeNum } from "@rbxts/serikanum";
import { getAsset } from "shared/asset/AssetMap";
import DifficultyReward from "shared/difficulty/reward/DifficultyReward";

export = new DifficultyReward(script.Name, Difficulty.TrueEase)
    .setTitle("Easeful Ignition")
    .setDescription("Permanently increase furnace Difficulty Power gain by 1000 whenever a droplet is processed.")
    .setIcon(getAsset("assets/DifficultyPower.png"))
    .setCooldownSeconds(60)
    .setPrice({
        kind: "percentageOfDifficultyPower",
        percentage: 0,
    })
    .addEffect({
        kind: "increaseDifficultyPower",
        add: new OnoeNum(1000),
    });
