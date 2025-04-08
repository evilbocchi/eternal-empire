import Difficulty from "@antivivi/jjt-difficulties";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/Upgrader";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Enchanted Grass")
    .setDescription("Nevermind, maybe you can expect something out of grass! Boosts Funds by a whopping... %mul%. Doesn't stack with more of the same item. Nevermind, don't expect much.")
    .setDifficulty(Difficulty.Excavation)
    .setPrice(new CurrencyBundle().set("Funds", 100))
    .setRequiredHarvestableAmount("Grass", 25)
    .addPlaceableArea("BarrenIslands")
    .setLevelReq(2)

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 1.01))
    .stacks(false)

    .exit();