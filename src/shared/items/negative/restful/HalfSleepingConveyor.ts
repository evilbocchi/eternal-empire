import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Conveyor from "shared/item/Conveyor";

export = new Conveyor(script.Name)
.setName("Half Sleeping Conveyor")
.setDescription("Didn't this item already exist?")
.setDifficulty(Difficulty.Restful)
.setPrice(new Price().setCost("Funds", 225e15), 1, 10)
.addPlaceableArea("BarrenIslands")

.setSpeed(3);