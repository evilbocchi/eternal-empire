import HarvestingTool from "shared/item/traits/HarvestingTool";
import Item from "shared/item/Item";
import Crystal from "shared/items/excavation/Crystal";
import MagicalWood from "shared/items/excavation/harvestable/MagicalWood";
import Iron from "shared/items/excavation/Iron";
import CopperScythe from "shared/items/tools/CopperScythe";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import TierDifficulty from "shared/item/TierDifficulty";

export = new Item(script.Name)
    .setName("Reinforced Scythe")
    .setDescription("Harvests crops at a slow rate. Used by professional farmers who need more efficiency.")
    .setDifficulty(TierDifficulty.Tier2)
    .setPrice(new CurrencyBundle().set("Funds", 1e12), 1)
    .setRequiredItemAmount(Iron, 2)
    .setRequiredItemAmount(Crystal, 6)
    .setRequiredItemAmount(MagicalWood, 3)
    .setRequiredItemAmount(CopperScythe, 1)
    .setLevelReq(4)
    .setImage(78413440801321)

    .trait(HarvestingTool)
    .setToolType("Scythe")
    .setSpeed(18)
    .setDamage(2)

    .exit();