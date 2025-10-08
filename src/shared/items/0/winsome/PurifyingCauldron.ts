import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Furnace from "shared/item/traits/Furnace";
import Item from "shared/item/Item";
import Class0Shop from "../Class0Shop";

export = new Item(script.Name)
    .setName("Purifying Cauldron")
    .setDescription("A massive %mul% boost. Though, this also costs a pretty massive price.")
    .setDifficulty(Difficulty.Winsome)
    .setPrice(new CurrencyBundle().set("Dark Matter", 36000), 1)
    .addPlaceableArea("BarrenIslands")
    .soldAt(Class0Shop)

    .trait(Furnace)
    .setMul(new CurrencyBundle().set("Purifier Clicks", 26))

    .exit();
