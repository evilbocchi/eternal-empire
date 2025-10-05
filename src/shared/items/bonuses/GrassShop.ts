import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import Shop from "shared/item/traits/Shop";
import CorruptedGrass from "shared/items/excavation/harvestable/CorruptedGrass";
import EnchantedGrass from "shared/items/excavation/harvestable/EnchantedGrass";

export = new Item(script.Name)
    .setName("Grass Shop")
    .setDescription("A shop that sells grass.")
    .setDifficulty(Difficulty.Bonuses)

    .trait(Shop)
    .setItems([EnchantedGrass, CorruptedGrass])

    .exit();
