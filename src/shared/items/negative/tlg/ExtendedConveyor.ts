import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "@antivivi/jjt-difficulties";
import Conveyor from "shared/item/Conveyor";

export = new Conveyor(script.Name)
.setName("Extended Conveyor")
.setDescription("A slightly longer conveyor than usual. Has walls that make droplets unable to change directions.")
.setDifficulty(Difficulty.TheLowerGap)
.setPrice(new Price().setCost("Funds", 65), 1, 10)
.addPlaceableArea("BarrenIslands")

.setSpeed(5);