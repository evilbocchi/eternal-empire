import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/traits/dropper/Dropper";
import Item from "shared/item/Item";
import Class0Shop from "shared/items/0/Class0Shop";

export = new Item(script.Name)
    .setName("Quadruple Coin Miner")
    .setDescription("Produces %val% droplets per second. You really like producing Bitcoin, huh?")
    .setDifficulty(Difficulty.JustAir)
    .setPrice(new CurrencyBundle().set("Funds", 8e30).set("Skill", 20), 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .soldAt(Class0Shop)
    .persists("Skillification")

    .trait(Dropper)
    .setDroplet(Droplet.QuadrupleCoin)
    .setDropRate(1)

    .exit();
