import Difficulty from "@antivivi/jjt-difficulties";
import Furnace from "shared/item/Furnace";
import Price from "shared/Price";

export = new Furnace(script.Name)
.setName("Endless Void")
.setDescription("Looking into the depths of that seemingly eternal space brings you a massive headache, but who cares? %mul% droplet value makes it all worth it.")
.setDifficulty(Difficulty.Happylike)
.setPrice(new Price().setCost("Funds", 400e30).setCost("Power", 400e15), 1)
.addPlaceableArea("BarrenIslands", "SlamoVillage")
.persists("Skillification")
.setCreator("CoPKaDT")

.setMul(new Price().setCost("Funds", 1000).setCost("Skill", 1.5));