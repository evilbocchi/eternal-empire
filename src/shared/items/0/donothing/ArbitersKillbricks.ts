import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import { Killbrick } from "shared/item/Special";

export = new Killbrick.KillbrickUpgrader("ArbitersKillbricks")
.setName("Arbiters' Killbricks")
.setDescription("The ultimate balance, with 4 killbrick upgraders boosting Power and Bitcoin gain by 1.15x but dealing 10 damage each.")
.setDifficulty(Difficulty.DoNothing)
.setPrice(new Price().setCost("Funds", 24.5e24).setCost("Bitcoin", 90), 1)
.setPrice(new Price().setCost("Funds", 42.5e24).setCost("Bitcoin", 180), 2)
.addPlaceableArea("BarrenIslands", "SlamoVillage")
.persists("Skillification")

.setDamage(10)
.setMul(new Price().setCost("Bitcoin", 1.15).setCost("Power", 1.15));