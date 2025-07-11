import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Upgrader from "shared/item/Upgrader";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

export = new Upgrader("ElevatedUpgrader")
.setName("Elevated Upgrader")
.setDescription("A little high... Increases droplet value by $2x.")
.setDifficulty(Difficulty.FelixTheA)
.setPrice(new Price().setCost("Funds", new InfiniteMath([25, 12])), 1)
.addPlaceableArea(AREAS.BarrenIslands)

.setSpeed(5)
.setMul(new Price().setCost("Funds", 2));