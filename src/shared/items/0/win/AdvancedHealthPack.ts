import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Damager from "shared/item/traits/upgrader/Damager";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import Class0Shop from "../Class0Shop";

export = new Item("AdvancedHealthPack")
    .setName("Advanced Health Pack")
    .setDescription("Looks extremely similar to a Basic Health Pack, yet twice as potent, giving droplets %hp_add%.")
    .setDifficulty(Difficulty.Win)
    .setPrice(new CurrencyBundle().set("Funds", 12.51e24), 1)
    .setPrice(new CurrencyBundle().set("Funds", 24.51e24), 2)
    .addPlaceableArea("BarrenIslands")
    .soldAt(Class0Shop)

    .trait(Upgrader)

    .trait(Damager)
    .setDamage(-100)

    .trait(Conveyor)
    .setSpeed(2)

    .exit();
