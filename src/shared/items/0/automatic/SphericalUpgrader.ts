import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Damager from "shared/item/traits/upgrader/Damager";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import MagicalCraftingTable from "shared/items/0/millisecondless/MagicalCraftingTable";

export = new Item(script.Name)
    .setName("Spherical Healer")
    .setDescription("Heals droplets for %hp_add%.")
    .setDifficulty(Difficulty.Automatic)
    .setPrice(new CurrencyBundle().set("Skill", 8000000), 1)
    .setCreator("GIDS214")
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .soldAt(MagicalCraftingTable)
    .persists()

    .trait(Upgrader)

    .trait(Damager)
    .setDamage(-20)

    .trait(Conveyor)
    .setSpeed(5)

    .exit();
