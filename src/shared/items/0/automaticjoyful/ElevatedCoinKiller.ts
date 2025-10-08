import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Damager from "shared/item/traits/upgrader/Damager";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import MagicalCraftingTable from "shared/items/0/millisecondless/MagicalCraftingTable";
import Quartz from "shared/items/excavation/Quartz";

export = new Item(script.Name)
    .setName("Elevated Coin Killer")
    .setDescription("A hastened death. %add% in exchange for %hp_add%.")
    .setDifficulty(Difficulty.AutomaticJoyful)
    .setPrice(new CurrencyBundle().set("Bitcoin", 16e6))
    .setRequiredItemAmount(Quartz, 1)
    .addPlaceableArea("BarrenIslands")
    .soldAt(MagicalCraftingTable)
    .setCreator("eeeesdfew")
    .persists()

    .trait(Upgrader)
    .setAdd(new CurrencyBundle().set("Bitcoin", 4))

    .trait(Damager)
    .setDamage(50)

    .trait(Conveyor)
    .setSpeed(10)

    .exit();
