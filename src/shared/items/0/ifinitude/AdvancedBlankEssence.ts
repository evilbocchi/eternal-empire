import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Class0Shop from "shared/items/0/Class0Shop";

export = new Item(script.Name)
    .setName("Advanced Blank Essence")
    .setDescription(
        "Didn't expect another one of these to pop up so soon, did you? Each purchase of this item will raise the price of the next by 1000x Funds and 100x Power.",
    )
    .setDifficulty(Difficulty.Ifinitude)
    .setPrice(new CurrencyBundle().set("Funds", 1e30).set("Power", 100e15), 1)
    .setPrice(new CurrencyBundle().set("Funds", 1e33).set("Power", 10e18), 2)
    .setPrice(new CurrencyBundle().set("Funds", 1e36).set("Power", 1e21), 3)
    .setPrice(new CurrencyBundle().set("Funds", 1e39).set("Power", 100e21), 4)
    .setPrice(new CurrencyBundle().set("Funds", 1e42).set("Power", 10e24), 5)
    .addPlaceableArea("BarrenIslands")
    .soldAt(Class0Shop);
