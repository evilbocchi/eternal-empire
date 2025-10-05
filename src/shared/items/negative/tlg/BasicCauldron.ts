import Difficulty from "@rbxts/ejt";
import Furnace from "shared/item/traits/Furnace";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Basic Cauldron")
    .setDescription("Processes droplets for %mul% more Funds, but must be directly dropped into.")
    .setDifficulty(Difficulty.TheLowerGap)
    .setPrice(new CurrencyBundle().set("Funds", 5000), 1)
    .addPlaceableArea("BarrenIslands")

    .trait(Furnace)
    .acceptsUpgrades(false)
    .setMul(new CurrencyBundle().set("Funds", 25))
    .exit();
