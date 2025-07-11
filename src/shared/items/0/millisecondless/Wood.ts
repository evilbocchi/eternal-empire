import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Item from "shared/item/Item";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

export = new Item("Wood")
.setName("Wood")
.setDescription("Exactly what it says. Wood.")
.setDifficulty(Difficulty.Millisecondless)
.addPlaceableArea(AREAS.SlamoVillage)
.setPrice(new Price().setCost("Funds", new InfiniteMath([1, 24])), 1, 10);