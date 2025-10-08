import Difficulty from "@rbxts/ejt";
import InstantiationDelimiter from "shared/item/traits/InstantiationDelimiter";
import Item from "shared/item/Item";
import InstantiationDelimiterIII from "shared/items/negative/skip/InstantiationDelimiterIII";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Class0Shop from "shared/items/0/Class0Shop";

export = new Item(script.Name)
    .setName("Instantiation Delimiter IV")
    .setDescription("The final Barren Islands delimiter. Increases droplet limit by 80. Does not drain.")
    .setDifficulty(Difficulty.Walkthrough)
    .setPrice(new CurrencyBundle().set("Power", 800e18).set("Skill", 1500), 1)
    .setRequiredItemAmount(InstantiationDelimiterIII, 1)
    .addPlaceableArea("BarrenIslands")
    .soldAt(Class0Shop)

    .trait(InstantiationDelimiter)
    .setDropletIncrease(80)

    .exit();
