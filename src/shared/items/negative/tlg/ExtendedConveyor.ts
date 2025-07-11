import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Conveyor from "shared/item/Conveyor";

export = new Conveyor("ExtendedConveyor")
.setName("Extended Conveyor")
.setDescription("More conveyors for your conveying needs! Takes a bit more space though, and unable to change directions.")
.setDifficulty(Difficulty.TheLowerGap)
.setPrice(new Price().setCost("Funds", 65), 1, 10)
.addPlaceableArea(AREAS.BarrenIslands)

.setSpeed(5);