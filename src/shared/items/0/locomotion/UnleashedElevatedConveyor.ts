import Difficulty from "@antivivi/jjt-difficulties";
import Conveyor from "shared/item/Conveyor";
import Price from "shared/Price";

export = new Conveyor(script.Name)
.setName("Unleashed Elevated Conveyor")
.setDescription("Racing above ground, bringing your droplets via. aerial means.")
.setDifficulty(Difficulty.Locomotion)
.setPrice(new Price().setCost("Skill", 3), 1, 30)
.addPlaceableArea("BarrenIslands", "SlamoVillage")
.persists("Skillification")

.setSpeed(9);