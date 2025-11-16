import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Massless from "shared/item/traits/status/Massless";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import Class1Shop from "shared/items/1/Class1Shop";

export = new Item(script.Name)
    .setName("Anti-Gravity Converter")
    .setDescription(
        "Let your droplets defy gravity with this converter. Don't let them off-track, though, or they might just float away forever. Applies %massless% to droplets, giving a x1.2 boost to ALL currencies.",
    )
    .setDifficulty(Difficulty.Joyful)
    .setPrice(new CurrencyBundle().set("Funds", 20), 1)
    .setPrice(new CurrencyBundle().set("Funds", 20e24), 2)
    .setPrice(new CurrencyBundle().set("Funds", 20e48), 3)
    .setPrice(new CurrencyBundle().set("Funds", 20e72), 4)
    .setPrice(new CurrencyBundle().set("Funds", 20e96), 5)
    .setCreator("sanjay2133")
    .addPlaceableArea("BarrenIslands", "SlamoVillage", "SkyPavilion")
    .soldAt(Class1Shop)

    .trait(Conveyor)
    .setSpeed(4)

    .trait(Upgrader)
    .trait(Massless)

    .exit();
