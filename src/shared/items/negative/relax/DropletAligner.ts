import Difficulty from "@antivivi/jjt-difficulties";
import Conveyor from "shared/item/Conveyor";
import Price from "shared/Price";

export = new Conveyor(script.Name)
.setName("Droplet Aligner")
.setDescription("Moves droplets to the direct center of the conveyor and pushes them forward. Useful for a few things.")
.setDifficulty(Difficulty.Relax)
.setPrice(new Price().setCost("Funds", 345e15), 1, 5)
.setPrice(new Price().setCost("Funds", 3.45e18), 6, 10)
.addPlaceableArea("BarrenIslands")

.setSpeed(6);