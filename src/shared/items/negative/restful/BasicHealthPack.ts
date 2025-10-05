import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Damager from "shared/item/traits/upgrader/Damager";
import Upgrader from "shared/item/traits/upgrader/Upgrader";

export = new Item(script.Name)
    .setName("Basic Health Pack")
    .setDescription("Gives droplets directly dropped into this upgrader an extra %hp_add%.")
    .setDifficulty(Difficulty.Restful)
    .setPrice(new CurrencyBundle().set("Funds", 35.15e18), 1)
    .setPrice(new CurrencyBundle().set("Funds", 85.5e18), 2)
    .setPrice(new CurrencyBundle().set("Funds", 160e18), 3)
    .addPlaceableArea("BarrenIslands")

    .trait(Upgrader)

    .trait(Damager)
    .setDamage(-50)

    .trait(Conveyor)
    .setSpeed(2)

    .exit();
