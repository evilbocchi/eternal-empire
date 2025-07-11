import HarvestingTool from "shared/item/HarvestingTool";
import ExcavationStone from "shared/items/excavation/ExcavationStone";
import MagicalWood from "shared/items/excavation/harvestable/MagicalWood";
import WhiteGem from "shared/items/excavation/WhiteGem";
import CopperAxe from "shared/items/tools/CopperAxe";
import Price from "shared/Price";
import TierDifficulty from "shared/utils/TierDifficulty";

export = new HarvestingTool(script.Name)
.setName("Reinforced Axe")
.setDescription("Harvests wood at a slow rate. Used by professional woodcutters who need more efficiency.")
.setDifficulty(TierDifficulty.Tier2)
.setPrice(new Price().setCost("Funds", 1e12), 1)
.setRequiredItemAmount(WhiteGem, 3)
.setRequiredItemAmount(ExcavationStone, 9)
.setRequiredItemAmount(MagicalWood, 2)
.setRequiredItemAmount(CopperAxe, 1)
.setToolType("Axe")
.setSpeed(18)
.setLevelReq(4)
.setDamage(2)
.setImage(125688985856246)
