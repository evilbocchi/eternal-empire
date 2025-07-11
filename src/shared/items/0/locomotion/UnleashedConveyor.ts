import Difficulty from "@antivivi/jjt-difficulties";
import Conveyor from "shared/item/Conveyor";
import Price from "shared/Price";

export = new Conveyor(script.Name)
.setName("Unleashed Conveyor")
.setDescription("Gone berserk, this conveyor is running at max speed to ensure your droplets are moved quickly.")
.setDifficulty(Difficulty.Locomotion)
.setPrice(new Price().setCost("Funds", 1e30), 1, 30)
.addPlaceableArea("BarrenIslands", "SlamoVillage")
.persists("Skillification")

.setSpeed(9);