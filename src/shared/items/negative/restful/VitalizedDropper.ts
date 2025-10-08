import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import Dropper from "shared/item/traits/dropper/Dropper";
import ClassLowerNegativeShop from "shared/items/negative/ClassLowerNegativeShop";

export = new Item(script.Name)
    .setName("Vitalized Dropper")
    .setDescription("Produces %val% droplets per second with droplets having %health%.")
    .setDifficulty(Difficulty.Restful)
    .setPrice(new CurrencyBundle().set("Funds", 60e18).set("Power", 10e9), 1)
    .setPrice(new CurrencyBundle().set("Funds", 240e18).set("Power", 35e9), 2)
    .addPlaceableArea("BarrenIslands")
    .soldAt(ClassLowerNegativeShop)

    .trait(Dropper)
    .setDroplet(Droplet.VitalizedDroplet)
    .setDropRate(1)

    .exit();
