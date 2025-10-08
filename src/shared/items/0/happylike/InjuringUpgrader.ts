import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import Damager from "shared/item/traits/upgrader/Damager";
import Class0Shop from "../Class0Shop";

export = new Item(script.Name)
    .setName("Injuring Upgrader")
    .setDescription(
        "I'm telling you, that smile is deceiving. It is out to kill you. Does %hp_add% to droplets, but gives a %mul% boost.",
    )
    .setDifficulty(Difficulty.Happylike)
    .setPrice(new CurrencyBundle().set("Funds", 2e33), 1)
    .setPrice(new CurrencyBundle().set("Funds", 5e33), 2)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .soldAt(Class0Shop)
    .persists("Skillification")

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 2.25).set("Skill", 2.25))

    .trait(Damager)
    .setDamage(70)

    .trait(Conveyor)
    .setSpeed(5)

    .exit();
