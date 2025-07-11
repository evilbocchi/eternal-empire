import Difficulty from "shared/Difficulty";
import Shop from "shared/item/Shop";
import HeavyFoundry from "shared/items/miscellaneous/HeavyFoundry";

export = new Shop("MagicalCraftingTable")
.setName("Magical Crafting Table")
.setDifficulty(Difficulty.Bonuses)
.setItems([
    HeavyFoundry
]);