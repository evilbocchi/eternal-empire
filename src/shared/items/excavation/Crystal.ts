import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Crystal")
    .setDescription(
        "A precious metal made from the crystallization of liquid Amethyst in the low pressures of Sky Pavilion. Highly reactive with White Gems.",
    )
    .setDifficulty(Difficulty.Excavation)
    .placeableEverywhere()
    .persists();
