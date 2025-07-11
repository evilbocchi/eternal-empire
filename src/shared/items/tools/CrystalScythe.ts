import HarvestingTool from "shared/item/HarvestingTool";
import Crystal from "shared/items/excavation/Crystal";
import MagicalWood from "shared/items/excavation/harvestable/MagicalWood";
import ReinforcedScythe from "shared/items/tools/ReinforcedScythe";
import Price from "shared/Price";
import TierDifficulty from "shared/utils/TierDifficulty";

export = new HarvestingTool(script.Name)
.setName("Crystal Scythe")
.setDescription("Harvests crops at a normal rate. Used by professional farmers who need more efficiency.")
.setDifficulty(TierDifficulty.Tier3)
.setPrice(new Price().setCost("Power", 100000), 1)
.setRequiredItemAmount(Crystal, 4)
.setRequiredItemAmount(MagicalWood, 5)
.setRequiredItemAmount(ReinforcedScythe, 1)
.setToolType("Scythe")
.setSpeed(20)
.setLevelReq(8)
.setDamage(10)
.setImage(118510633463495)
