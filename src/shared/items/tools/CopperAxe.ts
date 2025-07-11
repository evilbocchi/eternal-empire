import HarvestingTool from "shared/item/HarvestingTool";
import Price from "shared/Price";
import TierDifficulty from "shared/utils/TierDifficulty";

export = new HarvestingTool(script.Name)
.setName("Copper Axe")
.setDescription("Harvests wood at a very slow rate. Sufficient for the average woodcutter.")
.setDifficulty(TierDifficulty.Tier1)
.setPrice(new Price().setCost("Funds", 1e9), 1)
.setToolType("Axe")
.setSpeed(8)
.setLevelReq(1)
.setDamage(1)
.setImage(120559796879009);