import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import ExcavationShop from "shared/items/bonuses/ExcavationShop";
import Jade from "shared/items/excavation/Jade";

export = new Item(script.Name)
    .setName("Obsidian")
    .setDescription(
        "Volcanic glass forged in ancient eruptions. Razor sharp, yet prized for its uncanny ability to store arcane energy.",
    )
    .setDifficulty(Difficulty.Excavation)
    .setRequiredItemAmount(Jade, 256)
    .placeableEverywhere()
    .soldAt(ExcavationShop)
    .persists();
