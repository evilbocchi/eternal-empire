import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import InstantiationDelimiter from "shared/item/traits/InstantiationDelimiter";
import Item from "shared/item/Item";
import InstantiationDelimiterI from "shared/items/negative/negativity/InstantiationDelimiterI";

export = new Item(script.Name)
    .setName("Instantiation Delimiter II")
    .setDescription("Increases droplet limit by 40, at the cost of %drain%.")
    .setDifficulty(Difficulty.A)
    .setPrice(new CurrencyBundle().set("Power", 30000), 1)
    .setRequiredItemAmount(InstantiationDelimiterI, 1)
    .addPlaceableArea("BarrenIslands")

    .setDrain(new CurrencyBundle().set("Power", 15))

    .trait(InstantiationDelimiter)
    .setDropletIncrease(40)

    .exit();
