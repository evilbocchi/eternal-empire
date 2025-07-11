import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import { Killbrick } from "shared/item/Special";

export = new Killbrick.KillbrickUpgrader("AdvancedHealthPack")
.setName("Advanced Health Pack")
.setDescription("Looks extremely similar to a Basic Health Pack, yet twice as potent, giving droplets 100 HP.")
.setDifficulty(Difficulty.Win)
.setPrice(new Price().setCost("Funds", 12.51e24), 1)
.setPrice(new Price().setCost("Funds", 24.51e24), 2)
.addPlaceableArea("BarrenIslands")

.setSpeed(2)
.setDamage(-100);