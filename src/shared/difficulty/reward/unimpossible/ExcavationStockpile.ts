import Difficulty from "@rbxts/ejt";
import { getAsset } from "shared/asset/AssetMap";
import DifficultyReward from "shared/difficulty/reward/DifficultyReward";

export = new DifficultyReward(script.Name, Difficulty.Unimpossible)
    .setTitle("Excavation Stockpile")
    .setDescription("Synthesize a Stone every minute to fuel your digs.")
    .setIcon(getAsset("assets/MiscellaneousDifficulty.png"))
    .setViewportItemId("ExcavationStone")
    .setCooldownSeconds(60)
    .setPrice({
        kind: "percentageOfDifficultyPower",
        percentage: 0,
    })
    .addEffect({
        kind: "grantItem",
        itemId: "ExcavationStone",
    });
