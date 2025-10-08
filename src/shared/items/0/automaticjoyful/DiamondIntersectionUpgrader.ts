import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import Damager from "shared/item/traits/upgrader/Damager";
import Class0Shop from "shared/items/0/Class0Shop";

export = new Item(script.Name)
    .setName("Diamond Intersection Upgrader")
    .setDescription(
        "I forged a diamond just for you. Let it intersect through your veins for a %mul% boost, dealing %hp_add% to droplets.",
    )
    .setDifficulty(Difficulty.AutomaticJoyful)
    .setPrice(new CurrencyBundle().set("Funds", 1.8e36).set("Skill", 800), 1)
    .setPrice(new CurrencyBundle().set("Funds", 5e36).set("Skill", 2000), 2)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .soldAt(Class0Shop)
    .persists("Skillification")

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Skill", 1.8))

    .trait(Damager)
    .setDamage(5)

    .trait(Conveyor)
    .setSpeed(4)

    .exit();
