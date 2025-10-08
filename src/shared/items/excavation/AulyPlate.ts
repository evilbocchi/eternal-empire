import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import ExcavationShop from "shared/items/bonuses/ExcavationShop";
import Gyge from "shared/items/excavation/Gyge";

export = new Item(script.Name)
    .setName("Auly Plate")
    .setDescription(
        "A pale gold laminate forged from layered microfibers. Lightweight, yet reinforces any chassis it touches.",
    )
    .setDifficulty(Difficulty.Excavation)
    .setRequiredItemAmount(Gyge, 256)
    .placeableEverywhere()
    .soldAt(ExcavationShop)
    .persists();
