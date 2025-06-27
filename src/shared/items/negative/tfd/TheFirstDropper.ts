import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/traits/Dropper";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("The First Dropper")
    .setDescription("Produces droplets. Place this dropper above a furnace to start earning Funds.")
    .setDifficulty(Difficulty.TheFirstDifficulty)
    .setPrice(new CurrencyBundle().set("Funds", 0), 1)
    .setPrice(new CurrencyBundle().set("Funds", 10), 2)
    .setPrice(new CurrencyBundle().set("Funds", 55), 3)
    .addPlaceableArea("BarrenIslands")

    .trait(Dropper)
    .setDroplet(Droplet.TheFirstDroplet)
    .setDropRate(1)

    .exit();