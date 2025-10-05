import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("100K Visits Trophy")
    .setDescription("To commemorate 100K visits!")
    .setDifficulty(Difficulty.Bonuses)
    .setPrice(new CurrencyBundle().set("Funds", 100000), 1)
    .placeableEverywhere();
