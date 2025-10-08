import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Furnace from "shared/item/traits/Furnace";
import Class1Shop from "shared/items/1/Class1Shop";

export = new Item(script.Name)
    .setName("Aquatic Furnace")
    .setDescription(
        `A furnace that only works on low levels.
%mul% value.`,
    )
    .setDifficulty(Difficulty.DoSomething)
    .setPrice(new CurrencyBundle().set("Skill", 400), 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .soldAt(Class1Shop)
    .setCreator("sanjay2133")

    .trait(Furnace)
    .setMul(new CurrencyBundle().set("Funds", 1000000).set("Power", 10000).set("Skill", 100))

    .exit();
