import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import ExcavationShop from "../bonuses/ExcavationShop";

export = new Item(script.Name)
    .setName("Boracite")
    .setDescription(
        "A rare turquoise crystal with ferroelectric properties, perfect for synchronizing multi-phase droplet networks.",
    )
    .setDifficulty(Difficulty.Excavation)
    .placeableEverywhere()
    .soldAt(ExcavationShop)
    .persists();
