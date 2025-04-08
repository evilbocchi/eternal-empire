import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/traits/Dropper";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Bulky Dropper")
    .setDescription("Takes a lot of space, but generates %val% droplets per second.")
    .setDifficulty(Difficulty.TheLowerGap)
    .setPrice(new CurrencyBundle().set("Funds", 70), 1)
    .setPrice(new CurrencyBundle().set("Funds", 250), 2)
    .setPrice(new CurrencyBundle().set("Funds", 1000), 3)
    .addPlaceableArea("BarrenIslands")

    .trait(Dropper)
    .setDroplet(Droplet.FatDroplet)
    .setDropRate(1)

    .exit();