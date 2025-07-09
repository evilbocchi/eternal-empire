import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import Damager from "shared/item/traits/upgrader/Damager";

export = new Item(script.Name)
    .setName("Smiling Killer")
    .setDescription("The smile holds no remorse. Deals %hp_add% to droplets, but gives a %mul% boost.")
    .setDifficulty(Difficulty.Vintage)
    .setPrice(new CurrencyBundle().set("Funds", 100e27).set("Skill", 6).set("Bitcoin", 40000), 1)
    .addPlaceableArea("BarrenIslands")

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 1.6).set("Power", 1.8).set("Bitcoin", 1.35).set("Skill", 1.6))

    .trait(Damager)
    .setDamage(55)

    .exit();