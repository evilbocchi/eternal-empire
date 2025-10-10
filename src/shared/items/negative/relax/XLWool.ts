import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import WoolShop from "shared/items/bonuses/WoolShop";

export = new Item(script.Name)
    .setName("XL Wool")
    .setDescription("Wool but for people who need a lot of it.")
    .setDifficulty(Difficulty.Relax)
    .setPrice(new CurrencyBundle().set("Funds", 24e18).set("Power", 1000000))
    .placeableEverywhere()
    .soldAt(WoolShop)
    .persists();
