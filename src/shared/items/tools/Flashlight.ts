import HarvestingTool from "shared/item/traits/HarvestingTool";
import Item from "shared/item/Item";
import Crystal from "shared/items/excavation/Crystal";
import EnchantedGrass from "shared/items/excavation/harvestable/EnchantedGrass";
import MagicalWood from "shared/items/excavation/harvestable/MagicalWood";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import TierDifficulty from "shared/item/TierDifficulty";

export = new Item(script.Name)
    .setName("Flashlight")
    .setDescription("Portable light source for dark areas.")
    .setDifficulty(TierDifficulty.Tier2)
    .setPrice(new CurrencyBundle().set("Funds", 1e12), 1)
    .setRequiredItemAmount(MagicalWood, 3)
    .setRequiredItemAmount(EnchantedGrass, 9)
    .setRequiredItemAmount(Crystal, 1)
    .setLevelReq(4)
    .setImage(138746161403760)
    .setLayoutOrder(5)

    .trait(HarvestingTool)
    .exit();
