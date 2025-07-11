import Difficulty from "@antivivi/jjt-difficulties";
import Conveyor from "shared/item/Conveyor";
import Price from "shared/Price";

export = new Conveyor(script.Name)
.setName("Elevated Conveyor Corner")
.setDescription("May or may not be important for progression.")
.setDifficulty(Difficulty.FelixTheA)
.setPrice(new Price().setCost("Funds", 36.5e12), 1, 5)
.addPlaceableArea("BarrenIslands")

.setSpeed(5);