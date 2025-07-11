import Difficulty from "@antivivi/jjt-difficulties";
import Conveyor from "shared/item/Conveyor";
import Price from "shared/Price";

export = new Conveyor(script.Name)
.setName("Conversion Ramp")
.setDescription("Hey look, a way up! Oh, but it doesn't support elevating particularly heavy droplets.")
.setDifficulty(Difficulty.FelixTheA)
.setPrice(new Price().setCost("Funds", 15e12), 1, 5)
.addPlaceableArea("BarrenIslands")

.setSpeed(8);