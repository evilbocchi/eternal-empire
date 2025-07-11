import Difficulty from "@antivivi/jjt-difficulties";
import Upgrader from "shared/item/Upgrader";
import Price from "shared/Price";

export = new Upgrader(script.Name)
.setName("Blessed Conveyor")
.setDescription("A conveyor you can place in Barren Islands and Slamo Village! Droplets gain %mul% value as a bonus for touching the center.")
.setDifficulty(Difficulty.Blessing)
.setPrice(new Price().setCost("Bitcoin", 1000), 1, 5)
.addPlaceableArea("BarrenIslands")
.addPlaceableArea("SlamoVillage")
.persists("Skillification")

.setSpeed(4)
.setMul(new Price().setCost("Funds", 1.04));