import Difficulty from "@antivivi/jjt-difficulties";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/traits/Dropper";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Depressing Dropper")
    .setDescription("The best item in the game. Produces $0.01 droplets per second.")
    .setDifficulty(Difficulty.Ifinity)
    .setPrice(new CurrencyBundle().set("Funds", 450e18), 1)
    .setPrice(new CurrencyBundle().set("Funds", 4.5e21), 2)
    .addPlaceableArea("BarrenIslands")

    .trait(Dropper)
    .setDroplet(Droplet.DepressingDroplet)
    .setDropRate(1)

    .exit();