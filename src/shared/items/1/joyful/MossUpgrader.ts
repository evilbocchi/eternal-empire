import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Damager from "shared/item/traits/upgrader/Damager";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import MagicalCraftingTable from "shared/items/0/millisecondless/MagicalCraftingTable";
import CorruptedGrass from "shared/items/excavation/harvestable/CorruptedGrass";
import EnchantedGrass from "shared/items/excavation/harvestable/EnchantedGrass";
import Jade from "shared/items/excavation/Jade";

export = new Item(script.Name)
    .setName("Moss Upgrader")
    .setDescription(`%add% but deals %hp_add% damage to droplets passing through this mossy mess.`)
    .setDifficulty(Difficulty.Joyful)
    .setPrice(new CurrencyBundle().set("Skill", 1), 1)
    .setRequiredItemAmount(EnchantedGrass, 20)
    .setRequiredItemAmount(CorruptedGrass, 5)
    .setRequiredItemAmount(Jade, 1)
    .setCreator("superGirlygamer8o")
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .soldAt(MagicalCraftingTable)
    .persists()

    .trait(Upgrader)
    .setAdd(new CurrencyBundle().set("Dark Matter", 987654321))

    .trait(Damager)
    .setDamage(80)

    .exit();
