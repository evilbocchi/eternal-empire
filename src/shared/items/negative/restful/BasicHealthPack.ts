import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import { Killbrick } from "shared/item/Special";

export = new Killbrick.KillbrickUpgrader("BasicHealthPack")
.setName("Basic Health Pack")
.setDescription("Gives droplets directly dropped into this upgrader an extra 50 HP.")
.setDifficulty(Difficulty.Restful)
.setPrice(new Price().setCost("Funds", 35.15e18), 1)
.setPrice(new Price().setCost("Funds", 85.5e18), 2)
.setPrice(new Price().setCost("Funds", 160e18), 3)
.addPlaceableArea("BarrenIslands")

.setSpeed(2)
.setDamage(-50);