import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import ExcavationShop from "shared/items/bonuses/ExcavationShop";
import Lollipop from "shared/items/excavation/Lollipop";

export = new Item(script.Name)
    .setName("C0RR8PT10N")
    .setDescription(
        "A glitching neon crystal that flickers between realities. Engineers swear it distorts probability itself.",
    )
    .setDifficulty(Difficulty.Excavation)
    .setRequiredItemAmount(Lollipop, 256)
    .placeableEverywhere()
    .soldAt(ExcavationShop)
    .persists();
