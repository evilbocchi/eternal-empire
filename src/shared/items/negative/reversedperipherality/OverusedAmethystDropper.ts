import Difficulty from "@antivivi/jjt-difficulties";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/traits/Dropper";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Overused Amethyst Dropper")
    .setDescription("Once used by the ancient Slamos in 700 B, this droplet still holds up and produces %val% droplets per second.")
    .setDifficulty(Difficulty.ReversedPeripherality)
    .setPrice(new CurrencyBundle().set("Funds", 14e15).set("Power", 5500000), 1)
    .setPrice(new CurrencyBundle().set("Funds", 34e15).set("Power", 15000000), 2)
    .addPlaceableArea("BarrenIslands")

    .trait(Dropper)
    .setDroplet(Droplet.RustyAmethystDroplet)
    .setDropRate(1)

    .exit();