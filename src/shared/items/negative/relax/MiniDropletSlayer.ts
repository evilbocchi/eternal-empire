import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import NoobDropletSlayer from "shared/item/traits/other/NoobDropletSlayer";
import Upgrader from "shared/item/traits/upgrader/Upgrader";

export = new Item(script.Name)
    .setName("Mini Droplet Slayer")
    .setDescription("Mini noobs slaying droplets for $1.5x/2s. Only upgrades elevated droplets.")
    .setDifficulty(Difficulty.Relax)
    .setPrice(new CurrencyBundle().set("Funds", 6.2e18), 1)
    .setPrice(new CurrencyBundle().set("Funds", 20e18), 2)
    .addPlaceableArea("BarrenIslands")

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 1.5))

    .trait(NoobDropletSlayer)
    .setCooldown(2)
    .exit();
