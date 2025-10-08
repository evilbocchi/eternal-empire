import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import Dropper from "shared/item/traits/dropper/Dropper";
import ClassLowerNegativeShop from "shared/items/negative/ClassLowerNegativeShop";

export = new Item(script.Name)
    .setName("Vibrant Dropper")
    .setDescription(
        "Might want to get rid of that Grass Conveyor now, this dropper produces %val% droplets every 8 seconds.",
    )
    .setDifficulty(Difficulty.TrueEase)
    .setPrice(new CurrencyBundle().set("Funds", 55e9), 1)
    .setPrice(new CurrencyBundle().set("Funds", 220e9), 2)
    .setPrice(new CurrencyBundle().set("Funds", 1.2e12), 3)
    .addPlaceableArea("BarrenIslands")
    .soldAt(ClassLowerNegativeShop)

    .trait(Dropper)
    .setDroplet(Droplet.VibrantDroplet)
    .setDropRate(0.125)

    .exit();
