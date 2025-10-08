import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Shop from "shared/item/traits/Shop";
import CraftingShop from "shared/items/bonuses/CraftingShop";

export = new Item(script.Name)
    .setName("Crafting Table")
    .setDifficulty(Difficulty.TheFirstDifficulty)
    .setDescription("A table that allows you to craft items.")
    .setPrice(new CurrencyBundle().set("Funds", 1e42), 1)
    .placeableEverywhere()
    .soldAt(CraftingShop)
    .persists()

    .trait(Shop)
    .exit();
