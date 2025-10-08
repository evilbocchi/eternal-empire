import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import ExcavationShop from "shared/items/bonuses/ExcavationShop";
import Quartz from "shared/items/excavation/Quartz";

export = new Item(script.Name)
    .setName("Jade")
    .setDescription(
        "A beautiful green stone that is highly valued in many cultures. It is often used in jewelry and ornaments, symbolizing purity and serenity.",
    )
    .setDifficulty(Difficulty.Excavation)
    .setRequiredItemAmount(Quartz, 256)
    .placeableEverywhere()
    .soldAt(ExcavationShop)
    .persists();
