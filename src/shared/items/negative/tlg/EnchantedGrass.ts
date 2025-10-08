import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import GrassShop from "shared/items/bonuses/GrassShop";
import CraftingTable from "shared/items/negative/tfd/CraftingTable";
import Grass from "shared/items/negative/tfd/Grass";

export = new Item(script.Name)
    .setName("Enchanted Grass")
    .setDescription(
        "Grass but better. Boosts Funds by a whopping... %mul%. Doesn't stack with more of the same item. Don't expect much.",
    )
    .setDifficulty(Difficulty.TheLowerGap)
    .setPrice(new CurrencyBundle().set("Funds", 100))
    .setRequiredItemAmount(Grass, 25)
    .addPlaceableArea("BarrenIslands")
    .soldAt(CraftingTable, GrassShop)
    .persists()

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 1.01))
    .stacks(false)

    .exit();
