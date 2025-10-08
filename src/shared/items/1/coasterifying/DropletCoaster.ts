import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import Class1Shop from "shared/items/1/Class1Shop";

export = new Item(script.Name)
    .setName("Droplet Coaster")
    .setDescription("A roller coaster for droplets. Creates a great trade-off, modifying droplets by %mul%.")
    .setPrice(new CurrencyBundle().set("Power", 1e27), 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage", "SkyPavilion")
    .soldAt(Class1Shop)
    .setCreator("eeeesdfew")

    .trait(Conveyor)
    .setSpeed(10)

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Power", 3).set("Funds", 0.45))

    .exit();
