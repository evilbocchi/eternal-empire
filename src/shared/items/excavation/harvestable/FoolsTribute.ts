import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import MagicalCraftingTable from "shared/items/0/millisecondless/MagicalCraftingTable";
import Gold from "shared/items/excavation/Gold";
import EnchantedGrass from "shared/items/excavation/harvestable/EnchantedGrass";
import MagicalWood from "shared/items/excavation/harvestable/MagicalWood";

export = new Item(script.Name)
    .setName("Fool's Tribute")
    .setDescription(
        "Boosts Funds by %mul%. Doesn't stack with more of the same item. You're a fool for grinding the resources to create such a worthless item.",
    )
    .setDifficulty(Difficulty.Excavation)
    .setPrice(new CurrencyBundle().set("Funds", 123))
    .setRequiredItemAmount(EnchantedGrass, 100)
    .setRequiredItemAmount(MagicalWood, 40)
    .setRequiredItemAmount(Gold, 15)
    .addPlaceableArea("BarrenIslands")
    .soldAt(MagicalCraftingTable)
    .setLevelReq(10)

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 1.05))
    .stacks(false)

    .exit();
