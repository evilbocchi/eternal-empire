import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Furnace from "shared/item/traits/Furnace";

export = new Item(script.Name)
    .setName("Anti-Gravity Furnace")
    .setDescription(`A furnace that manipulates gravity to process droplets in a unique way. %mul% value.`)
    .setDifficulty(Difficulty.PressAKey)
    .setPrice(new CurrencyBundle().set("Skill", 600), 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .setCreator("eeeesdfew")

    .trait(Furnace)
    .setMul(new CurrencyBundle().set("Funds", 2000000).set("Power", 20000).set("Skill", 200))

    .exit();
