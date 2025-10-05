import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Massless from "shared/item/traits/status/Massless";
import Upgrader from "shared/item/traits/upgrader/Upgrader";

export = new Item(script.Name)
    .setName("Anti-Gravity Converter")
    .setDescription(
        "Let your droplets defy gravity with this converter. Don't let them off-track, though, or they might just float away forever. Applies %massless% to droplets, giving a x1.2 boost to ALL currencies.",
    )
    .setDifficulty(Difficulty.Joyful)
    .setPrice(new CurrencyBundle().set("Funds", 20), 1)
    .setPrice(new CurrencyBundle().set("Funds", 20e21), 2)
    .setPrice(new CurrencyBundle().set("Funds", 20e42), 3)
    .setPrice(new CurrencyBundle().set("Funds", 20e63), 4)
    .setPrice(new CurrencyBundle().set("Funds", 20e84), 5)
    .setCreator("sanjay2133")
    .addPlaceableArea("BarrenIslands", "SlamoVillage", "SkyPavilion")

    .trait(Conveyor)
    .setSpeed(4)

    .trait(Upgrader)
    .trait(Massless)

    .exit();
