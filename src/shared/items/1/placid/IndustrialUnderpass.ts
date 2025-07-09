import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Upgrader from "shared/item/traits/upgrader/Upgrader";

export = new Item(script.Name)
    .setName("Industrial Underpass")
    .setDescription("Sequel to the Industrial Overpass, except more placid. Droplets passing through the underpass feel more relaxed, gaining %mul% boosts passing through each laser.")
    .setDifficulty(Difficulty.Placid)
    .setPrice(new CurrencyBundle().set("Power", 4e27), 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage", "SkyPavilion")
    .setCreator("simple13579")

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Power", 2))

    .trait(Conveyor)
    .setSpeed(3)

    .exit();