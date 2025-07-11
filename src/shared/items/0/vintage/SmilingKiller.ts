import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import { Killbrick } from "shared/item/Special";

export = new Killbrick.KillbrickUpgrader(script.Name)
.setName("Smiling Killer")
.setDescription("The smile holds no remorse. Deals 55 damage to droplets, but gives a %mul% boost.")
.setDifficulty(Difficulty.Vintage)
.setPrice(new Price().setCost("Funds", 100e27).setCost("Skill", 6).setCost("Bitcoin", 40000), 1)
.addPlaceableArea("BarrenIslands")

.setDamage(55)
.setMul(new Price().setCost("Funds", 1.6).setCost("Power", 1.8).setCost("Bitcoin", 1.35))