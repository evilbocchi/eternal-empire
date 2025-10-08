import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import ExcavationShop from "shared/items/bonuses/ExcavationShop";
import Boracite from "shared/items/excavation/Boracite";

export = new Item(script.Name)
    .setName("Nissonite")
    .setDescription(
        "A midnight blue shard, said to form where lightning strikes ancient seabeds. It hums softly beneath ultraviolet light.",
    )
    .setDifficulty(Difficulty.Excavation)
    .setRequiredItemAmount(Boracite, 256)
    .placeableEverywhere()
    .soldAt(ExcavationShop)
    .persists();
