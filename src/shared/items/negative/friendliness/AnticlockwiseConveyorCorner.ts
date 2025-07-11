import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Conveyor from "shared/item/Conveyor";

export = new Conveyor("AnticlockwiseConveyorCorner")
.setName("Anti-clockwise Conveyor Corner")
.setDescription("Finally, a conveyor that goes anti-clockwise! Originally developed by the legend himself, Speed Bobs, his legacy lives on in the name of transporting droplets.")
.setDifficulty(Difficulty.Friendliness)
.setPrice(new Price().setCost("Funds", 9500000), 1, 5)
.addPlaceableArea(AREAS.BarrenIslands)

.setSpeed(5);