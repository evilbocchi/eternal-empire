import Difficulty from "@antivivi/jjt-difficulties";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/traits/dropper/Dropper";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Grass Dropper")
    .setDescription("You need more grass. A Grass Droplet from this dropper touching a Grass Conveyor transforms it into a Massive Grass Droplet worth $550.")
    .setDifficulty(Difficulty.Friendliness)
    .setPrice(new CurrencyBundle().set("Funds", 34500000), 1)
    .setPrice(new CurrencyBundle().set("Funds", 80000000), 2)
    .addPlaceableArea("BarrenIslands")

    .trait(Dropper)
    .setDroplet(Droplet.NativeGrassDroplet)
    .setDropRate(1)

    .exit();