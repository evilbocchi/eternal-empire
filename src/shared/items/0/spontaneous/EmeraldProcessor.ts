import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Damager from "shared/item/traits/upgrader/Damager";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import ReinforcedReactor from "shared/items/0/automatic/ReinforcedReactor";


export = new Item(script.Name)
    .setName("Emerald Reactor")
    .setDescription(`Welcome to the end of Class 0. Let me congratulate you on reaching this point; but also, let me warn you that clearing this point will not be easy.
Expect to spend a lot of time here, and good luck clearing Spontaneous.

The Emerald Reactor is a modified version of the ${ReinforcedReactor.name}, each entrance giving a %mul% boost but deals %hp_add% to droplets.`
    )
    .setDifficulty(Difficulty.Spontaneous)
    .setPrice(new CurrencyBundle().set("Funds", 5e42).set("Power", 1e27), 1)
    .setRequiredItemAmount(ReinforcedReactor, 1)
    .addPlaceableArea("BarrenIslands")
    .setCreator("sanjay2133")

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 7).set("Power", 2))

    .trait(Damager)
    .setDamage(20)

    .trait(Conveyor)
    .setSpeed(10)

    .exit();
