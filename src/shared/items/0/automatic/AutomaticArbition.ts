import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Damager from "shared/item/traits/upgrader/Damager";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import Class0Shop from "shared/items/0/Class0Shop";

export = new Item(script.Name)
    .setName("Automatic Arbition")
    .setDescription("Does ??? damage to droplets for a %mul% boost. Automatic arbitration was never a good idea.")
    .setDifficulty(Difficulty.Automatic)
    .setPrice(new CurrencyBundle().set("Dark Matter", 25e24).set("Skill", 25000000), 1)
    .setCreator("GIDS214")

    .addPlaceableArea("BarrenIslands")
    .soldAt(Class0Shop)
    .persists()

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Skill", 2))

    .trait(Damager)
    .setDamage(50)
    .setVariance(0.5)

    .exit();
