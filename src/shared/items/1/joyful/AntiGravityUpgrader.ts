import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import Class1Shop from "../Class1Shop";

export = new Item(script.Name)
    .setName("Anti-Gravity Upgrader")
    .setDescription(
        "Place this under an Anti-Gravity Converter for droplets passing through it to be boosted by %mul%.",
    )
    .setDifficulty(Difficulty.Joyful)
    .setPrice(new CurrencyBundle().set("Funds", 1000), 1)
    .setPrice(new CurrencyBundle().set("Funds", 1000e21), 2)
    .setCreator("shooerThe")
    .addPlaceableArea("BarrenIslands", "SlamoVillage", "SkyPavilion")
    .soldAt(Class1Shop)

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 3))

    .exit();
