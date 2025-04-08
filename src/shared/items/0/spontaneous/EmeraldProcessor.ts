import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Conveyor from "shared/item/traits/Conveyor";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/Upgrader";


export = new Item(script.Name)
    .setName("The Emerald Process")
    .setDescription("The end of Class 0. Start off with a simple bulky upgrader, each drop giving a %mul% boost.")
    .setDifficulty(Difficulty.Spontaneous)
    .setPrice(new CurrencyBundle().set("Funds", 1e42).set("Power", 100e24), 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .setCreator("sanjay2133")

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 1.8).set("Power", 1.8))

    .trait(Conveyor)
    .setSpeed(10)

    .exit();
