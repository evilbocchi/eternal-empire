import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import ExcavationShop from "shared/items/bonuses/ExcavationShop";

export = new Item(script.Name)
    .setName("Volt")
    .setDescription(
        "Crackling yellow ore packed with static charge. A single fragment can jump-start dormant machinery.",
    )
    .setDifficulty(Difficulty.Excavation)
    .placeableEverywhere()
    .soldAt(ExcavationShop)
    .persists();
