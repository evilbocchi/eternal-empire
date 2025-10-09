import Difficulty from "@rbxts/ejt";
import DifficultyReward from "shared/difficulty/reward/DifficultyReward";
import WhiteGem from "shared/items/excavation/WhiteGem";

export = new DifficultyReward(script.Name, Difficulty.A)
    .setTitle("Gems for All")
    .setDescription("Redeem 1 White Gem every 5 minutes at no cost.")
    .setViewportItemId(WhiteGem.id)
    .setCooldownSeconds(5 * 60)
    .setPrice({
        kind: "percentageOfDifficultyPower",
        percentage: 0,
    })
    .addEffect({
        kind: "grantItem",
        itemId: WhiteGem.id,
        amount: 1,
    });
