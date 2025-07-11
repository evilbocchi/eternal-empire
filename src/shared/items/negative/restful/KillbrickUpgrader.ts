import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import { AREAS } from "shared/constants";
import { Killbrick } from "shared/item/Special";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

export = new Killbrick.KillbrickUpgrader("KillbrickUpgrader")
.setName("Killbrick Upgrader")
.setDescription("Time to think. Does 20 damage to droplets, but boosts Funds and Power by 1.4x. Droplet value scales with its health by the following equation: <health / 100>, capping at 1x. Health defaults to 100.")
.setDifficulty(Difficulty.Restful)
.setPrice(new Price().setCost("Funds", new InfiniteMath([38.5, 18])), 1)
.setPrice(new Price().setCost("Funds", new InfiniteMath([58.1, 18])), 2)
.setPrice(new Price().setCost("Funds", new InfiniteMath([86.3, 18])), 3)
.setPrice(new Price().setCost("Funds", new InfiniteMath([110.7, 18])), 4)
.setPrice(new Price().setCost("Funds", new InfiniteMath([148.2, 18])), 5)
.setPrice(new Price().setCost("Funds", new InfiniteMath([185.1, 18])), 6)
.addPlaceableArea(AREAS.BarrenIslands)

.setSpeed(5)
.setDamage(20)
.setMul(new Price().setCost("Funds", 1.4).setCost("Power", 1.4));