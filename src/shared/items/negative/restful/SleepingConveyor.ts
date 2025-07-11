import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import Conveyor from "shared/item/Conveyor";

export = new Conveyor("SleepingConveyor")
.setName("Sleeping Conveyor")
.setDescription("Wait, you don't want speed? Fine then. Take some slow conveyors.")
.setDifficulty(Difficulty.Restful)
.setPrice(new Price().setCost("Funds", 225e15), 1, 10)
.addPlaceableArea("BarrenIslands")

.setSpeed(3);