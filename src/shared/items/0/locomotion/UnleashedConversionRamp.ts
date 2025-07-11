import Difficulty from "@antivivi/jjt-difficulties";
import Conveyor from "shared/item/Conveyor";
import Price from "shared/Price";

export = new Conveyor(script.Name)
.setName("Unleashed Conversion Ramp")
.setDescription("Bringing your droplets above ground has never been faster. May be slightly steeper, though.")
.setDifficulty(Difficulty.Locomotion)
.setPrice(new Price().setCost("Bitcoin", 10000), 1, 30)
.addPlaceableArea("BarrenIslands", "SlamoVillage")
.persists("Skillification")

.setSpeed(9);