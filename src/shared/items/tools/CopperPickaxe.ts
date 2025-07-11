import HarvestingTool from "shared/item/HarvestingTool";
import Price from "shared/Price";
import TierDifficulty from "shared/utils/TierDifficulty";

export = new HarvestingTool(script.Name)
.setName("Copper Pickaxe")
.setDescription("Harvests minerals at a very slow rate. Sufficient for the average miner.")
.setDifficulty(TierDifficulty.Tier1)
.setPrice(new Price().setCost("Funds", 1e9), 1)
.setToolType("Pickaxe")
.setSpeed(8)
.setLevelReq(1)
.setDamage(1)
.setImage(88369108808255);