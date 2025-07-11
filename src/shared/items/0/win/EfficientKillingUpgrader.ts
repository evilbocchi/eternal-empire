import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import { Killbrick } from "shared/item/Special";

export = new Killbrick.KillbrickUpgrader("EfficientKillingUpgrader")
.setName("Efficient Killing Upgrader")
.setDescription("Small yet deadly. Does 35 damage to droplets, but boosts Funds and Power by 1.95x.")
.setDifficulty(Difficulty.Win)
.setPrice(new Price().setCost("Funds", 3.85e24), 1)
.setPrice(new Price().setCost("Funds", 5.81e24), 2)
.setPrice(new Price().setCost("Funds", 8.63e24), 3)
.addPlaceableArea("BarrenIslands")

.setSpeed(5)
.setDamage(35)
.setMul(new Price().setCost("Funds", 1.95).setCost("Power", 1.95));