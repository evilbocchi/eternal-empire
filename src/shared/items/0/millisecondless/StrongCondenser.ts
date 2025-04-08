import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Condenser from "shared/item/traits/Condenser";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Strong Condenser")
    .setDescription("Produces %val% droplets when %quota% of those values are processed through the attached furnace.")
    .setDifficulty(Difficulty.Millisecondless)
    .setPrice(new CurrencyBundle().set("Funds", 1.28e24), 1)
    .addPlaceableArea("BarrenIslands")

    .trait(Condenser)
    .addDroplets(Droplet.LiquidestFundsDroplet, Droplet.LiquidestPowerDroplet)
    .setQuota(0.4)

    .exit();