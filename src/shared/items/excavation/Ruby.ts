import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import ExcavationShop from "shared/items/bonuses/ExcavationShop";
import Obsidian from "shared/items/excavation/Obsidian";

export = new Item(script.Name)
    .setName("Ruby")
    .setDescription(
        "A radiant crimson gemstone whose crystalline lattice resonates perfectly with high-heat furnaces and laser arrays.",
    )
    .setDifficulty(Difficulty.Excavation)
    .setRequiredItemAmount(Obsidian, 256)
    .placeableEverywhere()
    .soldAt(ExcavationShop)
    .persists();
