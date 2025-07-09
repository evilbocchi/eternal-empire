import Difficulty from "@antivivi/jjt-difficulties";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import Transformer from "shared/item/traits/upgrader/Transformer";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Magmatic Conveyor")
    .setDescription("It's time to heat up. Cleans amethyst droplets for $78K value. Anything else will be burned to char. :(")
    .setDifficulty(Difficulty.ReversedPeripherality)
    .setPrice(new CurrencyBundle().set("Funds", 1e18), 1)
    .addPlaceableArea("BarrenIslands")

    .trait(Transformer)
    .setSpeed(5)
    .setResult(Droplet.Char)
    .setResult(Droplet.AmethystDroplet, Droplet.RustyAmethystDroplet)

    .exit();