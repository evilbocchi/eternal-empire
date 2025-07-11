import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import { AREAS } from "shared/constants";
import { Killbrick } from "shared/item/Special";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

export = new Killbrick.KillbrickUpgrader("BasicHealthPack")
.setName("Basic Health Pack")
.setDescription("Gives droplets directly dropped into this upgrader an extra 50 HP.")
.setDifficulty(Difficulty.Restful)
.setPrice(new Price().setCost("Funds", new InfiniteMath([35.15, 18])), 1)
.setPrice(new Price().setCost("Funds", new InfiniteMath([85.5, 18])), 2)
.setPrice(new Price().setCost("Funds", new InfiniteMath([160, 18])), 3)
.addPlaceableArea(AREAS.BarrenIslands)

.setSpeed(2)
.setDamage(-50);