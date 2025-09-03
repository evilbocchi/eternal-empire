import Difficulty from "@antivivi/jjt-difficulties";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/traits/dropper/Dropper";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Purifiers' Dream")
    .setDescription(
        "An unfounded treasure meant solely for the mastery of purification, producing %val% droplets every 2 seconds.",
    )
    .setDifficulty(Difficulty.InstantWin)
    .setPrice(new CurrencyBundle().set("Funds", 9.9e21).set("Purifier Clicks", 8000), 1)
    .addPlaceableArea("BarrenIslands")

    .trait(Dropper)
    .setDroplet(Droplet.PurifiersDroplet)
    .setDropRate(0.5)

    .exit();
