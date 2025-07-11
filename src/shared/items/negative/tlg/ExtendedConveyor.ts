import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulties from "shared/difficulty/Difficulties";
import Conveyor from "shared/item/Conveyor";

export = new Conveyor("ExtendedConveyor")
.setName("Extended Conveyor")
.setDescription("More conveyors for your conveying needs! Takes a bit more space though, and unable to change directions.")
.setDifficulty(Difficulties.TheLowerGap)
.setPrice(new Price().setCost("Funds", 65), 1, 10)
.addPlaceableArea(AREAS.BarrenIslands)

.setSpeed(5);