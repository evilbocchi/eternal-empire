import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Crystal from "shared/items/excavation/Crystal";

export = new Item(script.Name)
    .setName("Iron")
    .setDescription(
        "Commonly found in abandoned caves, but nowadays harvested using advanced mining technology to prevent chance of falls.",
    )
    .setDifficulty(Difficulty.Excavation)
    .setPrice(new CurrencyBundle().set("Bitcoin", 1))
    .setRequiredItemAmount(Crystal, 256)
    .placeableEverywhere()
    .persists();
