import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import ExcavationShop from "shared/items/bonuses/ExcavationShop";
import Tetra from "shared/items/excavation/Tetra";

export = new Item(script.Name)
    .setName("Volt")
    .setDescription(
        "Crackling yellow ore packed with static charge. A single fragment can jump-start dormant machinery.",
    )
    .setDifficulty(Difficulty.Excavation)
    .setRequiredItemAmount(Tetra, 256)
    .placeableEverywhere()
    .soldAt(ExcavationShop)
    .persists();
