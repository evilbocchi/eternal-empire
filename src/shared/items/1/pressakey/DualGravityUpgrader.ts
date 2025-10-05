import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";

export = new Item(script.Name)
    .setName("Dual Gravity Upgrader")
    .setDescription("%mul%...")
    .setDifficulty(Difficulty.PressAKey)
    .setPrice(new CurrencyBundle().set("Funds", 2e22), 1)
    .setPrice(new CurrencyBundle().set("Funds", 2e44), 2)
    .setCreator(".fish0000")
    .addPlaceableArea("BarrenIslands", "SlamoVillage", "SkyPavilion")
    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 4).set("Power", 3).set("Bitcoin", 1.75))
    .exit();
