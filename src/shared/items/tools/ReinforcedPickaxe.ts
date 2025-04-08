import HarvestingTool from "shared/item/traits/HarvestingTool";
import Item from "shared/item/Item";
import ExcavationStone from "shared/items/excavation/ExcavationStone";
import MagicalWood from "shared/items/excavation/harvestable/MagicalWood";
import WhiteGem from "shared/items/excavation/WhiteGem";
import CopperPickaxe from "shared/items/tools/CopperPickaxe";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import TierDifficulty from "shared/item/TierDifficulty";

export = new Item(script.Name)
    .setName("Reinforced Pickaxe")
    .setDescription("Harvests minerals at a slow rate. Used by professional miners who need more efficiency.")
    .setDifficulty(TierDifficulty.Tier2)
    .setPrice(new CurrencyBundle().set("Funds", 1e12), 1)
    .setRequiredItemAmount(WhiteGem, 3)
    .setRequiredItemAmount(ExcavationStone, 9)
    .setRequiredItemAmount(MagicalWood, 2)
    .setRequiredItemAmount(CopperPickaxe, 1)
    .setLevelReq(4)
    .setImage(112062120021806)

    .trait(HarvestingTool)
    .setToolType("Pickaxe")
    .setSpeed(18)
    .setDamage(2)

    .exit();