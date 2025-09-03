import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import Grass from "shared/items/excavation/harvestable/Grass";

export = new Item(script.Name)
    .setName("Enchanted Grass")
    .setDescription(
        "Grass but better. Boosts Funds by a whopping... %mul%. Doesn't stack with more of the same item. Don't expect much.",
    )
    .setDifficulty(Difficulty.Excavation)
    .setPrice(new CurrencyBundle().set("Funds", 100))
    .setRequiredItemAmount(Grass, 25)
    .addPlaceableArea("BarrenIslands")
    .setLevelReq(2)

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 1.01))
    .stacks(false)

    .exit();
