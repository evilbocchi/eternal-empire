import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Item from "shared/item/Item";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

export = new Item("Glass")
.setName("Glass")
.setDescription("It didn't lie. This really is glass, costing quite the fortune.")
.setDifficulty(Difficulty.Millisecondless)
.addPlaceableArea(AREAS.SlamoVillage)
.setPrice(new Price().setCost("Funds", new InfiniteMath([1, 27])).setCost("Power", new InfiniteMath([1, 18])), 1, 10);