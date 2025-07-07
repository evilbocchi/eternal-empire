import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/Conveyor";
import Upgrader from "shared/item/traits/Upgrader";


export = new Item(script.Name)
    .setName("Automatic Railgun")
    .setDescription("Boom! Launches droplets to the skyline with a %mul% bang.")
    .setDifficulty(Difficulty.Automatic)
    .setPrice(new CurrencyBundle().set("Funds", 20e39).set("Bitcoin", 1e9), 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage", "SkyPavilion")
    .setCreator("simple13579")

    .trait(Conveyor)
    .setSpeed(20)

    .trait(Upgrader)
    .setSky(true)
    .setMul(new CurrencyBundle().set("Bitcoin", 4))

    .exit();
