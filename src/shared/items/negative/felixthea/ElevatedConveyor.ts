import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulties from "shared/difficulty/Difficulties";
import Conveyor from "shared/item/Conveyor";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

export = new Conveyor("ElevatedConveyor")
.setName("Elevated Conveyor")
.setDescription("In case you really love your droplets with an altitude.")
.setDifficulty(Difficulties.FelixTheA)
.setPrice(new Price().setCost("Funds", new InfiniteMath([30, 12])), 1, 10)
.addPlaceableArea(AREAS.BarrenIslands)

.setSpeed(6);