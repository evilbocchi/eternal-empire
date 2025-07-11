import Difficulty from "@antivivi/jjt-difficulties";
import Upgrader from "shared/item/Upgrader";
import Price from "shared/Price";

export = new Upgrader(script.Name)
.setName("Enchanted Grass")
.setDescription("Nevermind, maybe you can expect something out of grass! Boosts Funds by a whopping... %mul%. Doesn't stack with more of the same item. Nevermind, don't expect much.")
.setPrice(new Price().setCost("Funds", 100))
.setMul(new Price().setCost("Funds", 1.01))
.setRequiredHarvestableAmount("Grass", 25)
.addPlaceableArea("BarrenIslands")
.setLevelReq(2)
.stacks(false)
.setDifficulty(Difficulty.Excavation);