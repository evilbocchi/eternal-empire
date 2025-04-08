import Difficulty from "@antivivi/jjt-difficulties";
import InstantiationDelimiter from "shared/item/traits/InstantiationDelimiter";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import InstantiationDelimiterII from "../a/InstantiationDelimiterII";

export = new Item(script.Name)
    .setName("Instantiation Delimiter III")
    .setDescription("The Skip watches. Increases droplet limit by 60, at the cost of %drain%.")
    .setDifficulty(Difficulty.Skip)
    .setPrice(new CurrencyBundle().set("Funds", 27e18), 1)
    .setRequiredItemAmount(InstantiationDelimiterII, 1)
    .addPlaceableArea("BarrenIslands")

    .setDrain(new CurrencyBundle().set("Funds", 2e15))

    .trait(InstantiationDelimiter)
    .setDropletIncrease(60)
    .exit();
