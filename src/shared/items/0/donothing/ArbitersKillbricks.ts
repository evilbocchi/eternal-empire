import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/Upgrader";
import Damager from "shared/item/traits/special/Damager";

export = new Item(script.Name)
    .setName("Arbiters' Killbricks")
    .setDescription("The ultimate balance, with 4 killbrick upgraders boosting droplets by %mul% but dealing %hp_add% each.")
    .setDifficulty(Difficulty.DoNothing)
    .setPrice(new CurrencyBundle().set("Funds", 24.5e24).set("Bitcoin", 90), 1)
    .setPrice(new CurrencyBundle().set("Funds", 42.5e24).set("Bitcoin", 180), 2)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .persists("Skillification")

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Bitcoin", 1.15).set("Power", 1.15))

    .trait(Damager)
    .setDamage(10)

    .exit();