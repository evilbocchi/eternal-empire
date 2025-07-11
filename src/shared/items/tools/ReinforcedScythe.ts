import HarvestingTool from "shared/item/HarvestingTool";
import Crystal from "shared/items/excavation/Crystal";
import MagicalWood from "shared/items/excavation/harvestable/MagicalWood";
import Iron from "shared/items/excavation/Iron";
import CopperScythe from "shared/items/tools/CopperScythe";
import Price from "shared/Price";
import TierDifficulty from "shared/utils/TierDifficulty";

export = new HarvestingTool(script.Name)
.setName("Reinforced Scythe")
.setDescription("Harvests crops at a slow rate. Used by professional farmers who need more efficiency.")
.setDifficulty(TierDifficulty.Tier2)
.setPrice(new Price().setCost("Funds", 1e12), 1)
.setRequiredItemAmount(Iron, 2)
.setRequiredItemAmount(Crystal, 6)
.setRequiredItemAmount(MagicalWood, 3)
.setRequiredItemAmount(CopperScythe, 1)
.setToolType("Scythe")
.setSpeed(18)
.setLevelReq(4)
.setDamage(2)
.setImage(78413440801321)
