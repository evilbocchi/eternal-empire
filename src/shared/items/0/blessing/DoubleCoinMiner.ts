import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/traits/dropper/Dropper";
import Item from "shared/item/Item";
import Class0Shop from "../Class0Shop";

export = new Item(script.Name)
    .setName("Double Coin Miner")
    .setDescription(
        "Produces %val% droplets per second. It's getting less and less desirable to skillificate now, huh?",
    )
    .setDifficulty(Difficulty.Blessing)
    .setPrice(new CurrencyBundle().set("Funds", 20e27).set("Skill", 5), 1)

    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .soldAt(Class0Shop)
    .persists("Skillification")

    .trait(Dropper)
    .setDroplet(Droplet.DoubleCoin)
    .setDropRate(1)

    .exit();
