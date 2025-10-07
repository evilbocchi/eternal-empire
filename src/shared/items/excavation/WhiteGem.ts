import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import ExcavationStone from "shared/items/excavation/ExcavationStone";

export = new Item(script.Name)
    .setName("White Gem")
    .setDescription(
        "A commonly found metal used in the production of many electric appliances. Has a cheap cost of production, outweighing its unusually weak composition.",
    )
    .setDifficulty(Difficulty.Excavation)
    .setPrice(new CurrencyBundle().set("Funds", 1))
    .setRequiredItemAmount(ExcavationStone, 256)
    .placeableEverywhere()
    .persists();
