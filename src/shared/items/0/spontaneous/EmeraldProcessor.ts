import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Conveyor from "shared/item/traits/Conveyor";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/Upgrader";
import NormalReactor from "shared/items/0/millisecondless/NormalReactor";


export = new Item(script.Name)
    .setName("Emerald Reactor")
    .setDescription(`The end of Class 0. A modified version of the ${NormalReactor.name}, each drop gives a %mul% boost.`)
    .setDifficulty(Difficulty.Spontaneous)
    .setPrice(new CurrencyBundle().set("Funds", 1e42).set("Power", 100e24), 1)
    .setRequiredItemAmount(NormalReactor, 1)
    .addPlaceableArea("BarrenIslands")
    .setCreator("sanjay2133")

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 6).set("Power", 1.8))

    .trait(Conveyor)
    .setSpeed(10)

    .exit();
