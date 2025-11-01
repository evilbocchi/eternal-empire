import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Damager from "shared/item/traits/upgrader/Damager";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import ReinforcedReactor from "shared/items/0/automatic/ReinforcedReactor";
import Class0Shop from "shared/items/0/Class0Shop";

export = new Item(script.Name)
    .setName("Emerald Reactor")
    .setDescription(
        `Welcome to the end of Class 0. Let me congratulate you on reaching this point; but also, let me warn you that clearing this point will not be easy.
Expect to spend a lot of time here, and good luck clearing Spontaneous.

The Emerald Reactor is a modified version of the ${ReinforcedReactor.name}, each entrance giving a %mul% boost but deals %hp_add% to droplets.`,
    )
    .setDifficulty(Difficulty.Spontaneous)
    .setPrice(new CurrencyBundle().set("Funds", 25e42).set("Power", 100e24), 1)
    .setRequiredItemAmount(ReinforcedReactor, 1)
    .addPlaceableArea("BarrenIslands")
    .soldAt(Class0Shop)
    .setCreator("sanjay2133")

    .trait(Upgrader)
    .setSky(true)
    .setMul(new CurrencyBundle().set("Funds", 7).set("Power", 2))

    .trait(Damager)
    .setDamage(20)

    .trait(Conveyor)
    .setSpeed(10)

    .exit();
