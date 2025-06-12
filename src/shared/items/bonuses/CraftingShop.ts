import Difficulty from "@antivivi/jjt-difficulties";
import Item from "shared/item/Item";
import Shop from "shared/item/traits/Shop";
import CraftingTable from "shared/items/bonuses/CraftingTable";
import MagicalCraftingTable from "shared/items/bonuses/MagicalCraftingTable";

export = new Item(script.Name)
    .setName("Crafting Shop")
    .setDescription("A shop that sells crafting tables.")
    .setDifficulty(Difficulty.Bonuses)

    .trait(Shop)
    .setItems([
        CraftingTable,
        MagicalCraftingTable
    ])

    .exit();