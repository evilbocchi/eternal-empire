import HarvestingTool from "shared/item/HarvestingTool";
import Crystal from "shared/items/excavation/Crystal";
import MagicalWood from "shared/items/excavation/harvestable/MagicalWood";
import ReinforcedAxe from "shared/items/tools/ReinforcedAxe";
import Price from "shared/Price";
import TierDifficulty from "shared/utils/TierDifficulty";

export = new HarvestingTool(script.Name)
.setName("Crystal Axe")
.setDescription("Harvests wood at a normal rate. Used by professional woodcutters who need more efficiency.")
.setDifficulty(TierDifficulty.Tier3)
.setPrice(new Price().setCost("Power", 100000), 1)
.setRequiredItemAmount(Crystal, 6)
.setRequiredItemAmount(MagicalWood, 4)
.setRequiredItemAmount(ReinforcedAxe, 1)
.setToolType("Axe")
.setSpeed(20)
.setLevelReq(8)
.setDamage(10)
.setImage(71074515899449)
