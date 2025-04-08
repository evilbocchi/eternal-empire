import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/traits/Dropper";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Sexdecuple Coin Miner")
    .setDescription("We are reaching slightly ridiculous names now. Produces %val% droplets per second. Your choice to harvest for Bitcoin or Skill...")
    .setDifficulty(Difficulty.Unlosable)
    .setPrice(new CurrencyBundle().set("Skill", 40000).set("Bitcoin", 500e6), 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .persists("Skillification")

    .trait(Dropper)
    .setDroplet(Droplet.SexdecupleCoin)
    .setDropRate(1)

    .exit();