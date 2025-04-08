import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/traits/Dropper";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Heavy-weight Dropper")
    .setDescription("Despite the name, its build is actually quite modest. Produces %val% droplets every 2 seconds.")
    .setDifficulty(Difficulty.Negativity)
    .setPrice(new CurrencyBundle().set("Funds", 9000), 1)
    .setPrice(new CurrencyBundle().set("Funds", 14000), 2)
    .addPlaceableArea("BarrenIslands")

    .trait(Dropper)
    .setDroplet(Droplet.HeavyweightDroplet)
    .setDropRate(0.5)

    .exit();