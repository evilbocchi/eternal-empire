import Difficulty from "@rbxts/ejt";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/traits/dropper/Dropper";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Vitalized Dropper")
    .setDescription("Produces %val% droplets per second with droplets having %health%.")
    .setDifficulty(Difficulty.Restful)
    .setPrice(new CurrencyBundle().set("Funds", 60e18).set("Power", 10e9), 1)
    .setPrice(new CurrencyBundle().set("Funds", 240e18).set("Power", 35e9), 2)
    .addPlaceableArea("BarrenIslands")

    .trait(Dropper)
    .setDroplet(Droplet.VitalizedDroplet)
    .setDropRate(1)

    .exit();
