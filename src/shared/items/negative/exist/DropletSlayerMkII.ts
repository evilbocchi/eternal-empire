import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import NoobDropletSlayer from "shared/item/traits/other/NoobDropletSlayer";
import DropletSlayerMkI from "../negativity/DropletSlayerMkI";
import Upgrader from "shared/item/traits/upgrader/Upgrader";

export = new Item(script.Name)
    .setName("Droplet Slayer Mk. II")
    .setDescription("This is getting ridiculous. Literally hire a noob to slay droplets for you, multiplying their value by %mul% every 4 seconds.")
    .setDifficulty(Difficulty.Exist)
    .setPrice(new CurrencyBundle().set("Funds", 12.1e15), 1)
    .setRequiredItemAmount(DropletSlayerMkI, 1)
    .addPlaceableArea("BarrenIslands")

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 4).set("Power", 2))

    .trait(NoobDropletSlayer)
    .setCooldown(4)
    .exit();