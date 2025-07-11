import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulties from "shared/difficulty/Difficulties";
import Conveyor from "shared/item/Conveyor";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

export = new Conveyor("ConversionConveyor")
.setName("Conversion Conveyor")
.setDescription("From wide to narrow.")
.setDifficulty(Difficulties.ReversedPeripherality)
.setPrice(new Price().setCost("Funds", new InfiniteMath([340, 12])), 1, 5)
.addPlaceableArea(AREAS.BarrenIslands)

.setSpeed(4);