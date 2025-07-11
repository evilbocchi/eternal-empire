import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Furnace from "shared/item/Furnace";

export = new Furnace(script.Name)
.setName("Another World")
.setDescription("Seems to utilise resources from another dimension to process droplets for %mul% value.")
.setDifficulty(Difficulty.Sleepful)
.setPrice(new Price().setCost("Funds", 2.1e27).setCost("Skill", 5), 1)
.addPlaceableArea("SlamoVillage")
.setCreator("CoPKaDT")

.setMul(new Price().setCost("Funds", 50));