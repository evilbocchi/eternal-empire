import Difficulty from "@antivivi/jjt-difficulties";
import Upgrader from "shared/item/Upgrader";
import Gold from "shared/items/excavation/Gold";
import EnchantedGrass from "shared/items/excavation/harvestable/EnchantedGrass";
import MagicalWood from "shared/items/excavation/harvestable/MagicalWood";
import Price from "shared/Price";

export = new Upgrader(script.Name)
.setName("Fool's Tribute")
.setDescription("Boosts Funds by %mul%. Doesn't stack with more of the same item. You're a fool for grinding the resources to create such a worthless item.")
.setPrice(new Price().setCost("Funds", 123))
.setMul(new Price().setCost("Funds", 1.05))
.setRequiredItemAmount(EnchantedGrass, 100)
.setRequiredItemAmount(MagicalWood, 40)
.setRequiredItemAmount(Gold, 15)
.addPlaceableArea("BarrenIslands")
.setLevelReq(10)
.stacks(false)
.setDifficulty(Difficulty.Excavation);