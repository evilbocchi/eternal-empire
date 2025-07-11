import HarvestingTool from "shared/item/HarvestingTool";
import ExcavationStone from "shared/items/excavation/ExcavationStone";
import MagicalWood from "shared/items/excavation/harvestable/MagicalWood";
import WhiteGem from "shared/items/excavation/WhiteGem";
import CopperPickaxe from "shared/items/tools/CopperPickaxe";
import Price from "shared/Price";
import TierDifficulty from "shared/utils/TierDifficulty";

export = new HarvestingTool(script.Name)
.setName("Reinforced Pickaxe")
.setDescription("Harvests minerals at a slow rate. Used by professional miners who need more efficiency.")
.setDifficulty(TierDifficulty.Tier2)
.setPrice(new Price().setCost("Funds", 1e12), 1)
.setRequiredItemAmount(WhiteGem, 3)
.setRequiredItemAmount(ExcavationStone, 9)
.setRequiredItemAmount(MagicalWood, 2)
.setRequiredItemAmount(CopperPickaxe, 1)
.setToolType("Pickaxe")
.setSpeed(18)
.setLevelReq(4)
.setDamage(2)
.setImage(112062120021806)
