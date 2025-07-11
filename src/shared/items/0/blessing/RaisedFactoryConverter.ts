import Difficulty from "@antivivi/jjt-difficulties";
import Conveyor from "shared/item/Conveyor";
import Price from "shared/Price";

export = new Conveyor(script.Name)
.setName("Raised Funnel")
.setDescription("Funnels droplets into the center of a 3x3 grid area. Maybe you could find a use for this somehow?")
.setDifficulty(Difficulty.Blessing)
.setPrice(new Price().setCost("Skill", 1), 1, 5)
.setPrice(new Price().setCost("Skill", 2), 6, 10)
.addPlaceableArea("BarrenIslands", "SlamoVillage")
.persists("Skillification")

.setSpeed(4);