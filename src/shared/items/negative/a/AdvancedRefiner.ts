import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Upgrader from "shared/item/Upgrader";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

export = new Upgrader("AdvancedRefiner")
.setName("Advanced Refiner")
.setDescription("Boosts Funds and Power gain of droplets passing through this upgrader by 1.75x.")
.setDifficulty(Difficulty.A)
.setPrice(new Price().setCost("Funds", new InfiniteMath([4.5, 12])), 1)
.setPrice(new Price().setCost("Funds", new InfiniteMath([8.1, 12])), 2)
.setPrice(new Price().setCost("Funds", new InfiniteMath([16.3, 12])), 3)
.addPlaceableArea(AREAS.BarrenIslands)

.setMul(new Price().setCost("Funds", 1.75).setCost("Power", 1.75));