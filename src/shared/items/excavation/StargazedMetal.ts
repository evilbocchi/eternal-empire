import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import ExcavationShop from "shared/items/bonuses/ExcavationShop";
import C0RR8PT10N from "shared/items/excavation/C0RR8PT10N";

export = new Item(script.Name)
    .setName("Stargazed Metal")
    .setDescription(
        "Alloyed under meteor showers, this violet ingot bends light around its surface in mesmerizing waves.",
    )
    .setDifficulty(Difficulty.Excavation)
    .setRequiredItemAmount(C0RR8PT10N, 256)
    .placeableEverywhere()
    .soldAt(ExcavationShop)
    .persists();
