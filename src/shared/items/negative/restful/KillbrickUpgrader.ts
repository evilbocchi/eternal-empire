import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import { Killbrick } from "shared/item/Special";

export = new Killbrick.KillbrickUpgrader("KillbrickUpgrader")
.setName("Killbrick Upgrader")
.setDescription("Does 20 damage to droplets, but boosts Funds and Power by 1.4x. Droplet value scales with its health by the following equation: &lt;health / 100&gt;, capping at 1x. Health defaults to 100.")
.setDifficulty(Difficulty.Restful)
.setPrice(new Price().setCost("Funds", 38.5e18), 1)
.setPrice(new Price().setCost("Funds", 58.1e18), 2)
.setPrice(new Price().setCost("Funds", 86.3e18), 3)
.setPrice(new Price().setCost("Funds", 110.7e18), 4)
.setPrice(new Price().setCost("Funds", 148.2e18), 5)
.setPrice(new Price().setCost("Funds", 185.1e18), 6)
.addPlaceableArea("BarrenIslands")

.setSpeed(5)
.setDamage(20)
.setMul(new Price().setCost("Funds", 1.4).setCost("Power", 1.4));