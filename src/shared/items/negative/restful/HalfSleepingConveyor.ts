import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Conveyor from "shared/item/Conveyor";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

export = new Conveyor("HalfSleepingConveyor")
.setName("Half Sleeping Conveyor")
.setDescription("Didn't this item already exist?")
.setDifficulty(Difficulty.Restful)
.setPrice(new Price().setCost("Funds", new InfiniteMath([225, 15])), 1, 10)
.addPlaceableArea(AREAS.BarrenIslands)

.setSpeed(3);