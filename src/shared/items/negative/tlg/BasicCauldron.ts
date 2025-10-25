import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Furnace from "shared/item/traits/Furnace";
import ClassLowerNegativeShop from "shared/items/negative/ClassLowerNegativeShop";

export = new Item(script.Name)
    .setName("Basic Cauldron")
    .setDescription("Processes droplets for %mul% more Funds, but must be directly dropped into.")
    .setDifficulty(Difficulty.TheLowerGap)
    .setPrice(new CurrencyBundle().set("Funds", 5000), 1)
    .addPlaceableArea("BarrenIslands")
    .soldAt(ClassLowerNegativeShop)

    .trait(Furnace)
    .setIsCauldron(true)
    .setMul(new CurrencyBundle().set("Funds", 25))
    .exit();
