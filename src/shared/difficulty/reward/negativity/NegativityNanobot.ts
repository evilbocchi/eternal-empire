import Difficulty from "@rbxts/ejt";
import { OnoeNum } from "@rbxts/serikanum";
import DifficultyReward from "shared/difficulty/reward/DifficultyReward";
import BasicNanobot from "shared/items/negative/negativity/BasicNanobot";

export = new DifficultyReward(script.Name, Difficulty.Negativity)
    .setTitle("Negativity Nanobot")
    .setDescription("Redeem a Basic Nanobot to automatically repair your items.")
    .setViewportItemId(BasicNanobot.id)
    .setCooldownSeconds(5 * 60)
    .setPrice({
        kind: "percentageOfDifficultyPower",
        percentage: 0.75,
        minimum: new OnoeNum(1_000),
    })
    .addEffect({
        kind: "grantItem",
        itemId: BasicNanobot.id,
    });
