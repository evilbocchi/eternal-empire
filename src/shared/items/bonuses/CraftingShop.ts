import Difficulty from "@antivivi/jjt-difficulties";
import Item from "shared/item/Item";
import Shop from "shared/item/traits/Shop";
import CraftingTable from "shared/items/negative/tfd/CraftingTable";
import MagicalCraftingTable from "shared/items/0/millisecondless/MagicalCraftingTable";

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