import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Furnace from "shared/item/traits/Furnace";

export = new Item(script.Name)
    .setName("Aquatic Furnace")
    .setDescription(
        `A furnace that only works on low levels.
%mul% value.`,
    )
    .setDifficulty(Difficulty.DoSomething)
    .setPrice(new CurrencyBundle().set("Skill", 400), 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .setCreator("sanjay2133")

    .trait(Furnace)
    .setMul(new CurrencyBundle().set("Funds", 1000000).set("Power", 10000).set("Skill", 100))

    .exit();
