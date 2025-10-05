import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Iron")
    .setDescription(
        "Commonly found in abandoned caves, but nowadays harvested using advanced mining technology to prevent chance of falls.",
    )
    .setDifficulty(Difficulty.Excavation)
    .placeableEverywhere()
    .persists();
