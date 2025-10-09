import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import Nanobot from "shared/item/traits/other/Nanobot";

export = new Item(script.Name)
    .setName("Basic Nanobot")
    .setDescription(
        "Deploys three autonomous repair orbs that circle nearby machines. Every second, each orb has a %repair_chance% chance to repair a broken item within %repair_range% studs, granting a %repair_tier% fix.",
    )
    .setDifficulty(Difficulty.Negativity)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")

    .trait(Nanobot)
    .setRepairChance(0.05)
    .setRepairRange(75)
    .setRepairTier("Good")
    .setOrbit(5, 2.5)

    .exit();
