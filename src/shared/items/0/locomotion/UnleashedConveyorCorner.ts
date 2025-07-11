import Difficulty from "@antivivi/jjt-difficulties";
import Conveyor from "shared/item/Conveyor";
import Price from "shared/Price";

export = new Conveyor(script.Name)
.setName("Unleashed Conveyor Corner")
.setDescription("An even more compact version of the original Conveyor Corner, re-invented by the Open Slamo Community (OSC). Blazingly fast!")
.setDifficulty(Difficulty.Locomotion)
.setPrice(new Price().setCost("Power", 2e15), 1, 30)
.addPlaceableArea("BarrenIslands", "SlamoVillage")
.persists("Skillification")

.setSpeed(9);