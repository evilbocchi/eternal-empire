import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Upgrader from "shared/item/Upgrader";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

export = new Upgrader("PrecisionRefiner")
.setName("Precision Refiner")
.setDescription("A thin laser requiring utmost precision to upgrade droplets for $2x value.")
.setDifficulty(Difficulty.Relax)
.setPrice(new Price().setCost("Funds", new InfiniteMath([5, 18])), 1)
.setPrice(new Price().setCost("Funds", new InfiniteMath([11, 18])), 2)
.addPlaceableArea(AREAS.BarrenIslands)

.setMul(new Price().setCost("Funds", 2));