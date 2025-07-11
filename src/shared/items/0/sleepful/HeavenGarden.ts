import Difficulty from "@antivivi/jjt-difficulties";
import Special from "shared/item/Special";
import Price from "shared/Price";

export = new Special.Killbrick.KillbrickUpgrader("HeavenGarden")
.setName("Heaven's Garden")
.setDescription("Hurts so bad... Droplets are dealt 62.5 damage, but gain %mul% value. No idea why heaven is so cruel.")
.setDifficulty(Difficulty.Sleepful)
.setPrice(new Price().setCost("Power", 1.2e15).setCost("Skill", 5), 1)
.addPlaceableArea("BarrenIslands", "SlamoVillage")
.persists("Skillification")
.setCreator("CoPKaDT")

.setSpeed(4)
.setDamage(62.5)
.setMul(new Price().setCost("Power", 2.5).setCost("Bitcoin", 2));