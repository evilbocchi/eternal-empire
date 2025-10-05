import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Condenser from "shared/item/traits/dropper/Condenser";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Advanced Condenser")
    .setDescription(
        "Produces %val% droplets when %quota% of those values are processed through the attached furnace. Droplets can only be condensed once.",
    )
    .setDifficulty(Difficulty.Skip)
    .setPrice(new CurrencyBundle().set("Funds", 19.9e18), 1)
    .addPlaceableArea("BarrenIslands")

    .trait(Condenser)
    .addDroplets(Droplet.LiquiderFundsDroplet, Droplet.LiquiderPowerDroplet)
    .setQuota(0.45)

    .exit();
