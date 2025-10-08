import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import ClassLowerNegativeShop from "shared/items/negative/ClassLowerNegativeShop";

export = new Item(script.Name)
    .setName("Basic Blank Essence")
    .setDescription("A small piece of the Void, ready to manifest into whatever you choose.")
    .setDifficulty(Difficulty.InstantWin)
    .setPrice(new CurrencyBundle().set("Funds", 30e21).set("Power", 20e12).set("Purifier Clicks", 150000), 1)
    .addPlaceableArea("BarrenIslands")
    .soldAt(ClassLowerNegativeShop);
