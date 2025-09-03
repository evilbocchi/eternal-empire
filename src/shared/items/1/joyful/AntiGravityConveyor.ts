import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";

export = new Item(script.Name)
    .setName("Anti-Gravity Conveyor")
    .setDescription("A convenient conveyor suspended mid-air. This is Class 1.")
    .setDifficulty(Difficulty.Joyful)
    .setPrice(new CurrencyBundle().set("Funds", 5), 1)
    .setPrice(new CurrencyBundle().set("Funds", 5e21), 2)
    .setPrice(new CurrencyBundle().set("Funds", 5e42), 3)
    .setPrice(new CurrencyBundle().set("Funds", 5e63), 4)
    .setPrice(new CurrencyBundle().set("Funds", 5e84), 5)
    .setCreator("sanjay2133")
    .addPlaceableArea("BarrenIslands", "SlamoVillage", "SkyPavilion")

    .trait(Conveyor)
    .setSpeed(4)

    .exit();
