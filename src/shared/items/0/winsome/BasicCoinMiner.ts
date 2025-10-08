import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/traits/dropper/Dropper";
import Item from "shared/item/Item";
import Class0Shop from "shared/items/0/Class0Shop";

export = new Item(script.Name)
    .setName("Coin Miner")
    .setDescription("Start producing Bitcoin with %val% droplets per second.")
    .setDifficulty(Difficulty.Winsome)
    .setPrice(new CurrencyBundle().set("Funds", 20e24).set("Power", 305e12), 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .soldAt(Class0Shop)
    .persists("Skillification")

    .trait(Dropper)
    .setDroplet(Droplet.BasicCoin)
    .setDropRate(1)

    .exit();
