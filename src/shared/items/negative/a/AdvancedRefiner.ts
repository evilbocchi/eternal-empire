import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Advanced Refiner")
    .setDescription("Boosts droplets passing through this upgrader by %mul%.")
    .setDifficulty(Difficulty.A)
    .setPrice(new CurrencyBundle().set("Funds", 4.5e12), 1)
    .setPrice(new CurrencyBundle().set("Funds", 8.1e12), 2)
    .setPrice(new CurrencyBundle().set("Funds", 16.3e12), 3)
    .addPlaceableArea("BarrenIslands")

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 1.75).set("Power", 1.75))

    .exit();
