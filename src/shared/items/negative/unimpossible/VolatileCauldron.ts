import Difficulty from "@rbxts/ejt";
import Furnace from "shared/item/traits/Furnace";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import ClassLowerNegativeShop from "shared/items/negative/ClassLowerNegativeShop";

export = new Item(script.Name)
    .setName("Volatile Cauldron")
    .setDescription("A cauldron giving... some multiplier of Funds? I don't know.")
    .setDifficulty(Difficulty.Unimpossible)
    .setPrice(new CurrencyBundle().set("Funds", 700000), 1)
    .addPlaceableArea("BarrenIslands")
    .soldAt(ClassLowerNegativeShop)

    .trait(Furnace)
    .setIsCauldron(true)
    .setMul(new CurrencyBundle().set("Funds", 300))
    .setVariance(0.4)

    .exit();
