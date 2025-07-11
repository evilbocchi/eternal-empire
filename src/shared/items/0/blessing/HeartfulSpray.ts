import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import { Killbrick } from "shared/item/Special";

export = new Killbrick.KillbrickUpgrader(script.Name)
.setName("Heartful Spray")
.setDescription("Made with love &lt;3 Restores 20 HP to droplets.")
.setDifficulty(Difficulty.Blessing)
.setPrice(new Price().setCost("Skill", 5).setCost("Power", 5e15).setCost("Funds", 10e27), 1)
.setPrice(new Price().setCost("Skill", 8).setCost("Power", 8e15).setCost("Funds", 40e27), 2)
.setPrice(new Price().setCost("Skill", 11).setCost("Power", 20e15).setCost("Funds", 90e27), 3)
.setPrice(new Price().setCost("Skill", 18).setCost("Power", 60e15).setCost("Funds", 250e27), 4)
.addPlaceableArea("BarrenIslands")
.addPlaceableArea("SlamoVillage")
.persists("Skillification")

.setDamage(-20);