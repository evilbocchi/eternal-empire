import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import { Killbrick } from "shared/item/Special";

export = new Killbrick.KillbrickUpgrader(script.Name)
.setName("Injuring Upgrader")
.setDescription("I'm telling you, that smile is deceiving. It is out to kill you. Does 70 damage to droplets, but gives a %mul% boost.")
.setDifficulty(Difficulty.Happylike)
.setPrice(new Price().setCost("Funds", 2e33), 1)
.setPrice(new Price().setCost("Funds", 5e33), 2)
.addPlaceableArea("BarrenIslands", "SlamoVillage")
.persists("Skillification")

.setSpeed(5)
.setDamage(70)
.setMul(new Price().setCost("Funds", 2.25).setCost("Skill", 2.25));