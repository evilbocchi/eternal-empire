import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/traits/Dropper";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Lunary Dropper")
    .setDescription("You need some Funds. Producing %val% droplets every 2 seconds, it's unclear how this ancient dropper is still in such good condition.")
    .setDifficulty(Difficulty.Vintage)
    .setPrice(new CurrencyBundle().set("Funds", 44.4e27).set("Skill", 2), 1)
    .setPrice(new CurrencyBundle().set("Funds", 72.7e27).set("Skill", 4), 2)
    .setPrice(new CurrencyBundle().set("Funds", 444e27).set("Skill", 8), 3)
    .setPrice(new CurrencyBundle().set("Funds", 727e27).set("Skill", 16), 4)
    .setPrice(new CurrencyBundle().set("Funds", 4.44e30).set("Skill", 32), 5)
    .addPlaceableArea("BarrenIslands")

    .trait(Dropper)
    .setDroplet(Droplet.LunaryDroplet)
    .setDropRate(0.5)

    .exit();