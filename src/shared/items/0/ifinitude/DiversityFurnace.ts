import Difficulty from "@antivivi/jjt-difficulties";
import FurnaceUpgrader from "shared/item/FurnaceUpgrader";
import AdvancedBlankEssence from "shared/items/0/ifinitude/AdvancedBlankEssence";
import DualDropper from "shared/items/negative/a/DualDropper";
import Price from "shared/Price";

const mul = new Price().setCost("Bitcoin", 4);

const DiversityFurnace = new FurnaceUpgrader(script.Name)
.setName("Diversity Furnace")
.setDescription(`This amalgamation of an item is at least better than that ${DualDropper.name}... %mul% value to droplets for both the furnace and upgrader.`)
.setDifficulty(Difficulty.Ifinitude)
.setRequiredItemAmount(AdvancedBlankEssence, 1)
.setPrice(new Price().setCost("Power", 500e15).setCost("Skill", 20), 1)
.setCreator("CoPKaDT")

.addPlaceableArea("BarrenIslands")
.setMul(mul);
DiversityFurnace.furnace.setMul(mul);
DiversityFurnace.upgrader.setSpeed(4);
DiversityFurnace.upgrader.setMul(mul);

export = DiversityFurnace;