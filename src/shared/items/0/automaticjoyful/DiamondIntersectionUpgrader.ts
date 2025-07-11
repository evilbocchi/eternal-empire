import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import { Killbrick } from "shared/item/Special";

export = new Killbrick.KillbrickUpgrader(script.Name)
.setName("Diamond Intersection Upgrader")
.setDescription("I forged a diamond just for you. Let it intersect through your veins for a %mul% boost, dealing 5 damage to droplets.")
.setDifficulty(Difficulty.AutomaticJoyful)
.setPrice(new Price().setCost("Funds", 1.8e36).setCost("Skill", 800), 1)
.setPrice(new Price().setCost("Funds", 5e36).setCost("Skill", 2000), 2)
.addPlaceableArea("BarrenIslands", "SlamoVillage")
.persists("Skillification")

.setSpeed(4)
.setDamage(5)
.setMul(new Price().setCost("Skill", 1.8));