import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulties from "shared/difficulty/Difficulties";
import Upgrader from "shared/item/Upgrader";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

export = new Upgrader("ElevatedUpgrader")
.setName("Elevated Upgrader")
.setDescription("A little high... Increases droplet value by $2x.")
.setDifficulty(Difficulties.FelixTheA)
.setPrice(new Price().setCost("Funds", new InfiniteMath([52, 12])), 1)
.addPlaceableArea(AREAS.BarrenIslands)

.setSpeed(5)
.setMul(new Price().setCost("Funds", 2));