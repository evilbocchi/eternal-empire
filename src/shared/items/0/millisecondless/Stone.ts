import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Item from "shared/item/Item";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

export = new Item("Stone")
.setName("Stone")
.setDescription("What's better than wood? Stone.")
.setDifficulty(Difficulty.Millisecondless)
.addPlaceableArea(AREAS.SlamoVillage)
.setPrice(new Price().setCost("Power", new InfiniteMath([1, 15])), 1, 10);