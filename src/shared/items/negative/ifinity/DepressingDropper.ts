import Difficulty from "@rbxts/ejt";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/traits/dropper/Dropper";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import ClassLowerNegativeShop from "shared/items/negative/ClassLowerNegativeShop";

export = new Item(script.Name)
    .setName("Depressing Dropper")
    .setDescription("The best item in the game. Produces %val% droplets per second.")
    .setDifficulty(Difficulty.Ifinity)
    .setPrice(new CurrencyBundle().set("Funds", 450e18), 1)
    .setPrice(new CurrencyBundle().set("Funds", 4.5e21), 2)
    .addPlaceableArea("BarrenIslands")
    .soldAt(ClassLowerNegativeShop)

    .trait(Dropper)
    .setDroplet(Droplet.DepressingDroplet)
    .setDropRate(1)

    .exit();
