import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import ExcavationShop from "shared/items/bonuses/ExcavationShop";
import Bismuth from "shared/items/excavation/Bismuth";

export = new Item(script.Name)
    .setName("Boracite")
    .setDescription(
        "A rare turquoise crystal with ferroelectric properties, perfect for synchronizing multi-phase droplet networks.",
    )
    .setDifficulty(Difficulty.Excavation)
    .setRequiredItemAmount(Bismuth, 256)
    .placeableEverywhere()
    .soldAt(ExcavationShop)
    .persists();
