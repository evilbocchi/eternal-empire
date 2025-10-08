import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import ExcavationShop from "shared/items/bonuses/ExcavationShop";
import Nissonite from "shared/items/excavation/Nissonite";

export = new Item(script.Name)
    .setName("Orpiment")
    .setDescription(
        "A vivid scarlet mineral that leaves a metallic sheen wherever it touches. Handle with care—its fumes are legendary.",
    )
    .setDifficulty(Difficulty.Excavation)
    .setRequiredItemAmount(Nissonite, 256)
    .placeableEverywhere()
    .soldAt(ExcavationShop)
    .persists();
