import Difficulty from "@rbxts/ejt";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/traits/dropper/Dropper";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import ClassLowerNegativeShop from "shared/items/negative/ClassLowerNegativeShop";

export = new Item(script.Name)
    .setName("Overused Amethyst Dropper")
    .setDescription(
        "Once used by the ancient Slamos in 700 B, this droplet still holds up and produces %val% droplets per second.",
    )
    .setDifficulty(Difficulty.ReversedPeripherality)
    .setPrice(new CurrencyBundle().set("Funds", 14e15).set("Power", 5500000), 1)
    .setPrice(new CurrencyBundle().set("Funds", 34e15).set("Power", 15000000), 2)
    .addPlaceableArea("BarrenIslands")
    .soldAt(ClassLowerNegativeShop)

    .trait(Dropper)
    .setDroplet(Droplet.RustyAmethystDroplet)
    .setDropRate(1)

    .exit();
