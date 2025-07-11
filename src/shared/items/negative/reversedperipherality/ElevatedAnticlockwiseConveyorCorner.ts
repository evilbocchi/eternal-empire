import Difficulty from "@antivivi/jjt-difficulties";
import Conveyor from "shared/item/Conveyor";
import Price from "shared/Price";

export = new Conveyor(script.Name)
.setName("Elevated Anti-clockwise Conveyor Corner")
.setDescription("What a mouthful...")
.setDifficulty(Difficulty.ReversedPeripherality)
.setPrice(new Price().setCost("Funds", 36.5e15), 1, 5)
.addPlaceableArea("BarrenIslands")

.setSpeed(5);