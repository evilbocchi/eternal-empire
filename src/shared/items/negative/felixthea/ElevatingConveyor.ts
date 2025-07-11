import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Conveyor from "shared/item/Conveyor";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

export = new Conveyor("ElevatingConveyor")
.setName("Conversion Ramp")
.setDescription("Hey look, a way up! Oh, but it doesn't support elevating particularly heavy droplets.")
.setDifficulty(Difficulty.FelixTheA)
.setPrice(new Price().setCost("Funds", new InfiniteMath([15, 12])), 1, 5)
.addPlaceableArea(AREAS.BarrenIslands)

.setSpeed(8);