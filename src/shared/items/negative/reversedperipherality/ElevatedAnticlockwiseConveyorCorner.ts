import Difficulty from "shared/Difficulty";
import Conveyor from "shared/item/Conveyor";
import Price from "shared/Price";

export = new Conveyor("ElevatedAnticlockwiseConveyorCorner")
.setName("Elevated Anti-clockwise Conveyor Corner")
.setDescription("What a mouthful...")
.setDifficulty(Difficulty.ReversedPeripherality)
.setPrice(new Price().setCost("Funds", 36.5e15), 1, 5)
.addPlaceableArea("BarrenIslands")

.setSpeed(5);