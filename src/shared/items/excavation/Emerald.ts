import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import ExcavationShop from "shared/items/bonuses/ExcavationShop";
import Ruby from "shared/items/excavation/Ruby";

export = new Item(script.Name)
    .setName("Emerald")
    .setDescription(
        "A verdant gem saturated with natural mana. Commonly embedded in conduits to stabilize volatile energy flows.",
    )
    .setDifficulty(Difficulty.Excavation)
    .setRequiredItemAmount(Ruby, 256)
    .placeableEverywhere()
    .soldAt(ExcavationShop)
    .persists();
