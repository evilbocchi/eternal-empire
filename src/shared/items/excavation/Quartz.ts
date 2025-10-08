import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Gold from "shared/items/excavation/Gold";
import ExcavationShop from "../bonuses/ExcavationShop";

export = new Item(script.Name)
    .setName("Quartz")
    .setDescription(
        "No one knows why such a common mineral in the ancient days is so hard to come by nowadays. It's as if someone harvested all of it and kept it hidden beneath everyone's eyes.",
    )
    .setDifficulty(Difficulty.Excavation)
    .setPrice(new CurrencyBundle().set("Wins", 1))
    .setRequiredItemAmount(Gold, 256)
    .placeableEverywhere()
    .soldAt(ExcavationShop)
    .persists();
