import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Stargazed Metal")
    .setDescription(
        "Alloyed under meteor showers, this violet ingot bends light around its surface in mesmerizing waves.",
    )
    .setDifficulty(Difficulty.Excavation)
    .placeableEverywhere()
    .persists();
