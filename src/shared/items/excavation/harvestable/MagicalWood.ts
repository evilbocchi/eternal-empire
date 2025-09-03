import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import EnchantedGrass from "shared/items/excavation/harvestable/EnchantedGrass";
import StaleWood from "shared/items/excavation/harvestable/StaleWood";

export = new Item(script.Name)
    .setName("Magical Wood")
    .setDescription(
        "A man-made wood that never wears out. Great for making buildings, furniture, tools and other related structures. Also gives a %mul% boost to nearby droplets, though unstackable with multiple Magical Wood.",
    )
    .setDifficulty(Difficulty.Excavation)
    .setPrice(new CurrencyBundle().set("Power", 100))
    .setRequiredItemAmount(EnchantedGrass, 1)
    .setRequiredItemAmount(StaleWood, 15)
    .addPlaceableArea("BarrenIslands")
    .setLevelReq(2)

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 1.02))
    .stacks(false)

    .exit();
