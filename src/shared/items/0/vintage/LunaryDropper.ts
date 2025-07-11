import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";

export = new Dropper(script.Name)
.setName("Lunary Dropper")
.setDescription("You need some Funds. Producing %val% droplets per second, it's unclear how this ancient dropper is still in such good condition.")
.setDifficulty(Difficulty.Vintage)
.setPrice(new Price().setCost("Funds", 44.4e27).setCost("Skill", 2), 1)
.setPrice(new Price().setCost("Funds", 72.7e27).setCost("Skill", 4), 2)
.setPrice(new Price().setCost("Funds", 444e27).setCost("Skill", 8), 3)
.setPrice(new Price().setCost("Funds", 727e27).setCost("Skill", 16), 4)
.setPrice(new Price().setCost("Funds", 4.44e30).setCost("Skill", 32), 5)
.addPlaceableArea("BarrenIslands")

.setDroplet(Droplet.LunaryDroplet)
.setDropRate(1);