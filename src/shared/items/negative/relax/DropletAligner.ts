import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Conveyor from "shared/item/Conveyor";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

export = new Conveyor("DropletAligner")
.setName("Droplet Aligner")
.setDescription("Moves droplets to the direct center of the conveyor and pushes them forward. Useful for a few things.")
.setDifficulty(Difficulty.Relax)
.setPrice(new Price().setCost("Funds", new InfiniteMath([345, 15])), 1, 5)
.addPlaceableArea(AREAS.BarrenIslands)

.setSpeed(6);