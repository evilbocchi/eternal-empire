import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/traits/dropper/Dropper";
import Item from "shared/item/Item";
import Class0Shop from "../Class0Shop";

export = new Item(script.Name)
    .setName("Hydrating Dropper")
    .setDescription("Produces %val% droplets every 2 seconds, with droplets having %health%.")
    .setDifficulty(Difficulty.Win)
    .setPrice(new CurrencyBundle().set("Power", 70e12), 1)
    .setPrice(new CurrencyBundle().set("Power", 130e12), 2)
    .setPrice(new CurrencyBundle().set("Power", 210e12), 3)
    .addPlaceableArea("BarrenIslands")
    .soldAt(Class0Shop)

    .trait(Dropper)
    .setDroplet(Droplet.HydratingDroplet)
    .setDropRate(0.5)

    .exit();
