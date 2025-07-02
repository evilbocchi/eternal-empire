import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Furnace from "shared/item/traits/Furnace";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Aquatic Furnace")
    .setDescription("Suddenly, you don't need any other furnace before Class 1 anymore. %mul% value.")
    .setDifficulty(Difficulty.DoSomething)
    .setPrice(new CurrencyBundle().set("Skill", 400), 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .setCreator("sanjay2133")

    .trait(Furnace)
    .setMul(new CurrencyBundle().set("Funds", 1000000).set("Power", 10000).set("Skill", 100))

    .exit();