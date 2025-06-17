import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/Conveyor";
import Massless from "shared/item/traits/status/Massless";
import Upgrader from "shared/item/traits/Upgrader";


export = new Item(script.Name)
    .setName("Anti-Gravity Converter")
    .setDescription("Let your droplets defy gravity with this converter. Don't let them off-track, though, or they might just float away forever. Applies %massless% to droplets, giving a x1.2 boost to ALL currencies.")
    .setDifficulty(Difficulty.Joyful)
    .setPrice(new CurrencyBundle().set("Skill", 20e9), 1)
    .setCreator("sanjay2133")
    .addPlaceableArea("BarrenIslands", "SlamoVillage", "SkyPavilion")

    .trait(Conveyor)
    .setSpeed(4)

    .trait(Upgrader)
    .trait(Massless)

    .exit();