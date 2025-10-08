import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Furnace from "shared/item/traits/Furnace";
import ClassLowerNegativeShop from "shared/items/negative/ClassLowerNegativeShop";

export = new Item(script.Name)
    .setName("Improved Furnace")
    .setDescription("An upgraded version of The First Furnace. Processes droplets for %mul% more value.")
    .setDifficulty(Difficulty.TheLowerGap)
    .setPrice(new CurrencyBundle().set("Funds", 160), 1)
    .addPlaceableArea("BarrenIslands")
    .soldAt(ClassLowerNegativeShop)

    .trait(Furnace)
    .setMul(new CurrencyBundle().set("Funds", 2))
    .exit();
