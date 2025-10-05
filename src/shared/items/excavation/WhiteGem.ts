import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("White Gem")
    .setDescription(
        "A commonly found metal used in the production of many electric appliances. Has a cheap cost of production, outweighing its unusually weak composition.",
    )
    .setDifficulty(Difficulty.Excavation)
    .placeableEverywhere()
    .persists();
