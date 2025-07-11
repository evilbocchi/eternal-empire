import Difficulty from "@antivivi/jjt-difficulties";
import Upgrader from "shared/item/Upgrader";
import EnchantedGrass from "shared/items/excavation/harvestable/EnchantedGrass";
import Price from "shared/Price";

export = new Upgrader(script.Name)
.setName("Magical Wood")
.setDescription("A man-made wood that never wears out. Great for making buildings, furniture, tools and other related structures. Also gives a %mul% boost to nearby droplets, though unstackable with multiple Magical Wood.")
.setPrice(new Price().setCost("Power", 100))
.setMul(new Price().setCost("Funds", 1.02))
.setRequiredItemAmount(EnchantedGrass, 1)
.setRequiredHarvestableAmount("StaleWood", 15)
.addPlaceableArea("BarrenIslands")
.setLevelReq(2)
.stacks(false)
.setDifficulty(Difficulty.Excavation);