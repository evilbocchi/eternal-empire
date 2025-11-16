import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import { Grounder } from "shared/item/traits/status/Massless";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import Class1Shop from "shared/items/1/Class1Shop";

export = new Item(script.Name)
    .setName("Gravity Grounder")
    .setDescription("Brings anti-gravity droplets to the ground, removing the %massless% effect and its buffs.")
    .setDifficulty(Difficulty.Joyful)
    .setPrice(new CurrencyBundle().set("Funds", 500), 1)
    .setPrice(new CurrencyBundle().set("Funds", 500e24), 2)
    .setPrice(new CurrencyBundle().set("Funds", 500e48), 3)
    .setPrice(new CurrencyBundle().set("Funds", 500e72), 4)
    .setPrice(new CurrencyBundle().set("Funds", 500e96), 5)
    .setCreator("sanjay2133")
    .addPlaceableArea("BarrenIslands", "SlamoVillage", "SkyPavilion")
    .soldAt(Class1Shop)

    .trait(Conveyor)
    .setSpeed(4)

    .trait(Upgrader)
    .trait(Grounder)

    .exit();
