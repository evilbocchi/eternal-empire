import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/traits/dropper/Dropper";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Slope Dropper")
    .setDescription("Produces droplets off a slope, weeeeee")
    .setDifficulty(Difficulty.TheFirstDifficulty)
    .setPrice(new CurrencyBundle().set("Funds", 640e44).set("Power", 145e27), 1)
    .setPrice(new CurrencyBundle().set("Funds", 175e45).set("Power", 250e28), 2)
    .addPlaceableArea("BarrenIslands","SkyPavillion")

    .trait(Dropper)
    .setDroplet(Droplet.SlopeDroplet)
    .setDropRate(0.75)

    .exit();
