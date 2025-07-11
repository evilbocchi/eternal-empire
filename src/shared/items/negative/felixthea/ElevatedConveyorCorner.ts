import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Conveyor from "shared/item/Conveyor";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

export = new Conveyor("ElevatedConveyorCorner")
.setName("Elevated Conveyor Corner")
.setDescription("May or may not be important for progression.")
.setDifficulty(Difficulty.FelixTheA)
.setPrice(new Price().setCost("Funds", new InfiniteMath([36.5, 12])), 1, 5)
.addPlaceableArea(AREAS.BarrenIslands)

.setSpeed(5);