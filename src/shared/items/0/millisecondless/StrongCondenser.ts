import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Condenser from "shared/item/traits/dropper/Condenser";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import Class0Shop from "../Class0Shop";

export = new Item(script.Name)
    .setName("Strong Condenser")
    .setDescription("Produces %val% droplets when %quota% of those values are processed through the attached furnace.")
    .setDifficulty(Difficulty.Millisecondless)
    .setPrice(new CurrencyBundle().set("Funds", 1.28e24), 1)
    .addPlaceableArea("BarrenIslands")
    .soldAt(Class0Shop)

    .trait(Condenser)
    .addDroplets(Droplet.LiquidestFundsDroplet, Droplet.LiquidestPowerDroplet)
    .setQuota(0.4)

    .exit();
