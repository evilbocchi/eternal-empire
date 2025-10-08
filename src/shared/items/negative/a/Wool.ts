import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import WoolShop from "shared/items/bonuses/WoolShop";

export = new Item(script.Name)
    .setName("Wool")
    .setDescription("Wool for the masses.")
    .setDifficulty(Difficulty.TrueEase)
    .setPrice(new CurrencyBundle().set("Funds", 24e12).set("Power", 100))
    .placeableEverywhere()
    .soldAt(WoolShop)
    .persists();
