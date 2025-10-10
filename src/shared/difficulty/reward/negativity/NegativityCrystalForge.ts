import Difficulty from "@rbxts/ejt";
import DifficultyReward from "shared/difficulty/reward/DifficultyReward";
import CrystalIngot from "shared/items/negative/unimpossible/CrystalIngot";

export = new DifficultyReward(script.Name, Difficulty.Negativity)
    .setTitle("Crystal Forge")
    .setDescription("Forge a Crystal Ingot by fusing 6 Crystals.")
    .setViewportItemId(CrystalIngot.id)
    .setCooldownSeconds(15)
    .setLayoutOrder(1)
    .addEffect({
        kind: "forgeItem",
        itemId: CrystalIngot.id,
    });
