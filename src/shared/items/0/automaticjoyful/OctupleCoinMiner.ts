import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/traits/dropper/Dropper";
import Item from "shared/item/Item";
import Class0Shop from "shared/items/0/Class0Shop";

export = new Item(script.Name)
    .setName("Octuple Coin Miner")
    .setDescription("Produces %val% droplets per second. We love Bitcoin.")
    .setDifficulty(Difficulty.AutomaticJoyful)
    .setPrice(new CurrencyBundle().set("Funds", 8e36).set("Skill", 2000).set("Bitcoin", 20000000), 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .soldAt(Class0Shop)
    .persists("Skillification")

    .trait(Dropper)
    .setDroplet(Droplet.OctupleCoin)
    .setDropRate(1)

    .exit();
