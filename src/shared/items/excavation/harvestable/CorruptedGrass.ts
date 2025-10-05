import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import EnchantedGrass from "shared/items/excavation/harvestable/EnchantedGrass";

export = new Item(script.Name)
    .setName("Corrupted Grass")
    .setDescription(
        "Corruption in the shape of grass. What in the world happened to it? Boosts Funds by %mul%, but doesn't stack with more of the same item.",
    )
    .setDifficulty(Difficulty.Excavation)
    .setPrice(new CurrencyBundle().set("Funds", 100000))
    .setRequiredItemAmount(EnchantedGrass, 10)
    .addPlaceableArea("BarrenIslands")
    .setLevelReq(5)
    .persists()

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 1.05))
    .stacks(false)

    .exit();
