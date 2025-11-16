import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Condenser from "shared/item/traits/dropper/Condenser";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import Class0Shop from "shared/items/0/Class0Shop";

export = new Item(script.Name)
    .setName("Reinforced Condenser")
    .setDescription(
        "Your droplet count is reaching extreme limits, and you don't want to craft another Limit Breaker. Produces %val% droplets when %quota% of those values are processed through the attached furnace.",
    )
    .setDifficulty(Difficulty.Unlosable)
    .setPrice(new CurrencyBundle().set("Funds", 140e36).set("Bitcoin", 1e9), 1)
    .addPlaceableArea("BarrenIslands")
    .soldAt(Class0Shop)

    .trait(Condenser)
    .addDroplets(Droplet.LiquidesterFundsDroplet, Droplet.LiquidesterPowerDroplet, Droplet.LiquidesterBitcoinDroplet)
    .setQuota(0.35)

    .exit();
