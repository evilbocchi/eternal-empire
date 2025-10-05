import Difficulty from "@rbxts/ejt";
import Condenser from "shared/item/traits/dropper/Condenser";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Basic Condenser")
    .setDescription(
        "The successor to the Recycling Dropper. Produces %val% droplets when %quota% of those values are processed through the attached furnace.",
    )
    .setDifficulty(Difficulty.FelixTheDA)
    .setPrice(new CurrencyBundle().set("Funds", 256e12), 1)
    .addPlaceableArea("BarrenIslands")

    .trait(Condenser)
    .addDroplets(Droplet.LiquidFundsDroplet, Droplet.LiquidPowerDroplet)
    .setQuota(0.5)

    .exit();
