import Difficulty from "shared/Difficulty";
import Conveyor from "shared/item/Conveyor";
import Price from "shared/Price";

export = new Conveyor("ConversionConveyor")
.setName("Conversion Conveyor")
.setDescription("From wide to narrow.")
.setDifficulty(Difficulty.ReversedPeripherality)
.setPrice(new Price().setCost("Funds", 1e15), 1, 5)
.addPlaceableArea("BarrenIslands")

.setSpeed(4);