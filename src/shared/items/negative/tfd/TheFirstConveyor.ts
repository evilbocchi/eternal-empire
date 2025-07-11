import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "@antivivi/jjt-difficulties";
import Conveyor from "shared/item/Conveyor";

export = new Conveyor(script.Name)
.setName("The First Conveyor")
.setDescription("Moves stuff from one place to another. Use this to push droplets into furnaces.")
.setDifficulty(Difficulty.TheFirstDifficulty)
.setPrice(new Price().setCost("Funds", 5), 1, 5)
.addPlaceableArea("BarrenIslands")

.setSpeed(6);