import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Furnace from "shared/item/traits/Furnace";


export = new Item(script.Name)
    .setName("Light of Attrition")
    .setDescription(`A self-sustaining light that only concerns itself with sucking the life out of anything it touches. Processes droplets at %mul% value.`)
    .setDifficulty(Difficulty.Spontaneous)
    .setPrice(new CurrencyBundle().set("Funds", 600e45).set("Bitcoin", ), 1)
    .addPlaceableArea("BarrenIslands")
    .setCreator("sanjay2133")

    .trait(Furnace)
    .acceptsUpgrades(false)
    .setMul(new CurrencyBundle().set("Funds", 1e9).set("Power", 1e6).set("Skill", 1e3))

    .exit();