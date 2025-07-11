import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Conveyor from "shared/item/Conveyor";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

export = new Conveyor("ConversionConveyor")
.setName("Conversion Conveyor")
.setDescription("From wide to narrow.")
.setDifficulty(Difficulty.ReversedPeripherality)
.setPrice(new Price().setCost("Funds", new InfiniteMath([1, 15])), 1, 5)
.addPlaceableArea(AREAS.BarrenIslands)

.setSpeed(4);