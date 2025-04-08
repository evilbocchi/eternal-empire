import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/traits/Dropper";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Double Coin Miner")
    .setDescription("Produces %val% droplets per second. It's getting less and less desirable to skillificate now, huh?")
    .setDifficulty(Difficulty.Blessing)
    .setPrice(new CurrencyBundle().set("Funds", 20e27).set("Skill", 5), 1)

    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .persists("Skillification")

    .trait(Dropper)
    .setDroplet(Droplet.DoubleCoin)
    .setDropRate(1)

    .exit();