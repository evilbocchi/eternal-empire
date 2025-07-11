import Difficulty from "@antivivi/jjt-difficulties";
import Conveyor from "shared/item/Conveyor";
import Price from "shared/Price";

export = new Conveyor(script.Name)
.setName("Unleashed Elevated Anti-clockwise Conveyor Corner")
.setDescription("Why is this a name? Who wrote this and thought this was a good idea?")
.setDifficulty(Difficulty.Locomotion)
.setPrice(new Price().setCost("Skill", 12), 1, 30)
.addPlaceableArea("BarrenIslands", "SlamoVillage")
.persists("Skillification")

.setSpeed(9);