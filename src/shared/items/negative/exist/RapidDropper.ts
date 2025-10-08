import Difficulty from "@rbxts/ejt";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/traits/dropper/Dropper";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import ClassLowerNegativeShop from "shared/items/negative/ClassLowerNegativeShop";

export = new Item(script.Name)
    .setName("Rapid Dropper")
    .setDescription("Pew pew pew... or something. Produces %val% droplets every 0.5 seconds.")
    .setDifficulty(Difficulty.Exist)
    .setPrice(new CurrencyBundle().set("Funds", 920e12).set("Power", 740000), 1)
    .setPrice(new CurrencyBundle().set("Funds", 2.92e15).set("Power", 1520000), 2)
    .addPlaceableArea("BarrenIslands")
    .soldAt(ClassLowerNegativeShop)

    .trait(Dropper)
    .setDroplet(Droplet.RapidDroplet)
    .setDropRate(2)

    .exit();
