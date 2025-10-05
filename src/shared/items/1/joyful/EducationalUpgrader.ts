import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import CorruptedGrass from "shared/items/excavation/harvestable/CorruptedGrass";
import EnchantedGrass from "shared/items/excavation/harvestable/EnchantedGrass";
import Jade from "shared/items/excavation/Jade";

export = new Item(script.Name)
    .setName("Educational Upgrader")
    .setDescription(`Give your droplets an education! Allowing them to gain %add%`)
    .setDifficulty(Difficulty.Joyful)
    .setPrice(new CurrencyBundle().set("Skill", 1), 1)
    .setRequiredItemAmount(Stone, 600)
    .setRequiredItemAmount(EnchantedGrass, 120)
    .setRequiredItemAmount(Jade, 1)
    .setCreator("emoronq2k")
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .persists()

    .trait(Upgrader)
    .setAdd(new CurrencyBundle().set("Skill", 1))

    .exit();
