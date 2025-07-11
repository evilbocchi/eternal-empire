import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Charger from "shared/item/Charger";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

export = new Charger("IndustrialCharger")
.setName("Industrial Charger")
.setDescription("Speed Bobs is back at it again, inventing a charger that doesn't drain anything! Only boosts Power by 1.25x in a 12 stud radius though.")
.setDifficulty(Difficulty.Relax)
.setPrice(new Price().setCost("Funds", new InfiniteMath([1.8, 18])).setCost("Power", new InfiniteMath([1, 9])), 1)
.setPrice(new Price().setCost("Funds", new InfiniteMath([3.3, 18])).setCost("Power", new InfiniteMath([1.4, 9])), 2)
.addPlaceableArea(AREAS.BarrenIslands)

.setRadius(12)
.setMul(new Price().setCost("Power", 1.25));
