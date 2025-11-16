import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import Class1Shop from "shared/items/1/Class1Shop";

export = new Item(script.Name)
    .setName("Dual Gravity Upgrader")
    .setDescription("%mul%...")
    .setDifficulty(Difficulty.PressAKey)
    .setPrice(new CurrencyBundle().set("Funds", 3.16e22), 1)
    .setPrice(new CurrencyBundle().set("Funds", 10e45), 2)
    .setCreator(".fish0000")
    .addPlaceableArea("BarrenIslands", "SlamoVillage", "SkyPavilion")
    .soldAt(Class1Shop)
    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 4).set("Power", 3).set("Bitcoin", 1.75))
    .exit();
