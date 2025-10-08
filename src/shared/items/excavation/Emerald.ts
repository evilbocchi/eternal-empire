import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import ExcavationShop from "../bonuses/ExcavationShop";

export = new Item(script.Name)
    .setName("Emerald")
    .setDescription(
        "A verdant gem saturated with natural mana. Commonly embedded in conduits to stabilize volatile energy flows.",
    )
    .setDifficulty(Difficulty.Excavation)
    .placeableEverywhere()
    .soldAt(ExcavationShop)
    .persists();
