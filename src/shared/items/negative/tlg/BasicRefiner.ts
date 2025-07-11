import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Upgrader from "shared/item/Upgrader";

export = new Upgrader("BasicRefiner")
.setName("Basic Refiner")
.setDescription("A flag-like device used to refine droplets, increasing their value by $10.")
.setDifficulty(Difficulty.TheLowerGap)
.setPrice(new Price().setCost("Funds", 1000), 1)
.setPrice(new Price().setCost("Funds", 3600), 2)
.setPrice(new Price().setCost("Funds", 12200), 3)
.setPrice(new Price().setCost("Funds", 50000), 4)
.setPrice(new Price().setCost("Funds", 225000), 5, 10)
.addPlaceableArea(AREAS.BarrenIslands)

.setAdd(new Price().setCost("Funds", 10));