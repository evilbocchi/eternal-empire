import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("1M Visits Trophy")
    .setDescription("To commemorate 1M visits!")
    .setDifficulty(Difficulty.Bonuses)
    .setPrice(new CurrencyBundle().set("Funds", 1000000), 1)
    .placeableEverywhere();
