import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Furnace from "shared/item/traits/Furnace";
import Item from "shared/item/Item";
import Class0Shop from "shared/items/0/Class0Shop";

export = new Item(script.Name)
    .setName("Another World")
    .setDescription("Seems to utilise resources from another dimension to process droplets for %mul% value.")
    .setDifficulty(Difficulty.Sleepful)
    .setPrice(new CurrencyBundle().set("Funds", 2.1e27).set("Skill", 5), 1)
    .addPlaceableArea("SlamoVillage")
    .soldAt(Class0Shop)
    .setCreator("CoPKaDT")

    .trait(Furnace)
    .setMul(new CurrencyBundle().set("Funds", 50))

    .exit();
