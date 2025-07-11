import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";

export = new Dropper(script.Name)
.setName("Advanced Skill Factory")
.setDescription("Alright, it's time to actually pick up the pace. Produce %val% droplets per second.")
.setDifficulty(Difficulty.Walkthrough)
.setPrice(new Price().setCost("Funds", 15e33).setCost("Skill", 70), 1)
.setPrice(new Price().setCost("Funds", 70e33).setCost("Skill", 200), 2)

.addPlaceableArea("SlamoVillage")
.setDroplet(Droplet.SkillerDroplet)
.setDropRate(1)
.setSpeed(4)