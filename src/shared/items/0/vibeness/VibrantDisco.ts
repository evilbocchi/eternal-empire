import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Damager from "shared/item/traits/upgrader/Damager";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import Class0Shop from "shared/items/0/Class0Shop";

export = new Item(script.Name)
    .setName("Vibrant Disco")
    .setDescription("Let your droplets groove to the beat as they get healed by %hp_add%!")
    .setDifficulty(Difficulty.Vibeness)
    .setPrice(new CurrencyBundle().set("Funds", 142.5e42).set("Bitcoin", 250e9), 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage", "SkyPavilion")
    .soldAt(Class0Shop)
    .setCreator("sanjay2133")
    .persists()

    .trait(Upgrader)

    .trait(Damager)
    .setDamage(-40)

    .trait(Conveyor)
    .setSpeed(3)

    .exit();
