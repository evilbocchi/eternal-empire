import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import ExcavationShop from "shared/items/bonuses/ExcavationShop";

export = new Item(script.Name)
    .setName("Auly Plate")
    .setDescription(
        "A pale gold laminate forged from layered microfibers. Lightweight, yet reinforces any chassis it touches.",
    )
    .setDifficulty(Difficulty.Excavation)
    .placeableEverywhere()
    .soldAt(ExcavationShop)
    .persists();
