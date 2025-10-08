import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import ExcavationShop from "shared/items/bonuses/ExcavationShop";
import AulyPlate from "shared/items/excavation/AulyPlate";

export = new Item(script.Name)
    .setName("Shell Piece")
    .setDescription(
        "Fragments of an ancient exoshell, coated in pearlescent dust. Holds remarkable pressure tolerance.",
    )
    .setDifficulty(Difficulty.Excavation)
    .setRequiredItemAmount(AulyPlate, 256)
    .placeableEverywhere()
    .soldAt(ExcavationShop)
    .persists();
