import HarvestingTool from "shared/item/HarvestingTool";
import Crystal from "shared/items/excavation/Crystal";
import MagicalWood from "shared/items/excavation/harvestable/MagicalWood";
import ReinforcedPickaxe from "shared/items/tools/ReinforcedPickaxe";
import Price from "shared/Price";
import TierDifficulty from "shared/utils/TierDifficulty";

export = new HarvestingTool(script.Name)
.setName("Crystal Pickaxe")
.setDescription("Harvests minerals at a normal rate. Used by professional miners who need more efficiency.")
.setDifficulty(TierDifficulty.Tier3)
.setPrice(new Price().setCost("Power", 100000), 1)
.setRequiredItemAmount(Crystal, 6)
.setRequiredItemAmount(MagicalWood, 4)
.setRequiredItemAmount(ReinforcedPickaxe, 1)
.setToolType("Pickaxe")
.setSpeed(20)
.setLevelReq(8)
.setDamage(10)
.setImage(75418375441578)
