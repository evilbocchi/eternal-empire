import HarvestingTool from "shared/item/HarvestingTool";
import Crystal from "shared/items/excavation/Crystal";
import EnchantedGrass from "shared/items/excavation/harvestable/EnchantedGrass";
import MagicalWood from "shared/items/excavation/harvestable/MagicalWood";
import Price from "shared/Price";
import TierDifficulty from "shared/utils/TierDifficulty";

export = new HarvestingTool(script.Name)
.setName("Flashlight")
.setDescription("Seeing in the dark... portably.")
.setDifficulty(TierDifficulty.Tier2)
.setPrice(new Price().setCost("Funds", 1e12), 1)
.setRequiredItemAmount(MagicalWood, 3)
.setRequiredItemAmount(EnchantedGrass, 9)
.setRequiredItemAmount(Crystal, 1)
.setLevelReq(4)
.setImage(138746161403760)
