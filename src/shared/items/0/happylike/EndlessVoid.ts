import Difficulty from "@rbxts/ejt";
import Furnace from "shared/item/traits/Furnace";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Class0Shop from "../Class0Shop";

export = new Item(script.Name)
    .setName("Endless Void")
    .setDescription(
        "Looking into the depths of that seemingly eternal space brings you a massive headache, but who cares? %mul% droplet value makes it all worth it.",
    )
    .setDifficulty(Difficulty.Happylike)
    .setPrice(new CurrencyBundle().set("Funds", 400e30).set("Power", 400e15), 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .soldAt(Class0Shop)
    .persists("Skillification")
    .setCreator("CoPKaDT")

    .trait(Furnace)
    .setMul(new CurrencyBundle().set("Funds", 1000).set("Skill", 1.5))

    .exit();
