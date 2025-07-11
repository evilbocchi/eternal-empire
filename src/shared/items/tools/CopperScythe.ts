import HarvestingTool from "shared/item/HarvestingTool";
import Price from "shared/Price";
import TierDifficulty from "shared/utils/TierDifficulty";

export = new HarvestingTool(script.Name)
.setName("Copper Scythe")
.setDescription("Harvests crops at a very slow rate. Sufficient for the average farmer.")
.setDifficulty(TierDifficulty.Tier1)
.setPrice(new Price().setCost("Funds", 1e9), 1)
.setToolType("Scythe")
.setSpeed(8)
.setLevelReq(1)
.setDamage(1)
.setImage(110401457158030);