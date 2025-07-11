import Difficulty from "@antivivi/jjt-difficulties";
import Conveyor from "shared/item/Conveyor";
import Price from "shared/Price";

export = new Conveyor(script.Name)
.setName("Elevated Conveyor")
.setDescription("In case you really love your droplets with an altitude.")
.setDifficulty(Difficulty.FelixTheA)
.setPrice(new Price().setCost("Funds", 30e12), 1, 15)
.addPlaceableArea("BarrenIslands")

.setSpeed(6);