import Difficulty from "@rbxts/ejt";
import { OnoeNum } from "@rbxts/serikanum";
import { getAsset } from "shared/asset/AssetMap";
import DifficultyReward from "shared/difficulty/reward/DifficultyReward";

export = new DifficultyReward(script.Name, Difficulty.TheFirstDifficulty)
    .setTitle("Candy-Coated Consultation")
    .setDescription(
        "Trade a portion of your Difficulty Power for a kit that redeems 30 seconds of offline revenue when used.",
    )
    .setIcon(getAsset("assets/CandyResearchKit.png"))
    .setCooldownSeconds(60)
    .setLayoutOrder(9)
    .setPrice({
        kind: "percentageOfDifficultyPower",
        percentage: 0.5,
        minimum: new OnoeNum(1),
    })
    .addEffect({
        kind: "grantItem",
        itemId: "CandyResearchKit",
        amount: 1,
    });
