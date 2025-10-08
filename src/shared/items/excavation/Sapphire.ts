import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import ExcavationShop from "shared/items/bonuses/ExcavationShop";
import Emerald from "shared/items/excavation/Emerald";

export = new Item(script.Name)
    .setName("Sapphire")
    .setDescription(
        "A deep blue crystal that refracts light into steady pulses. Essential in optics for high-precision droplet scanners.",
    )
    .setDifficulty(Difficulty.Excavation)
    .setRequiredItemAmount(Emerald, 256)
    .placeableEverywhere()
    .soldAt(ExcavationShop)
    .persists();
