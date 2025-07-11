import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "@antivivi/jjt-difficulties";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";

export = new Dropper(script.Name)
.setName("Bulky Dropper")
.setDescription("Takes a lot of space, but generates %val% droplets per second.")
.setDifficulty(Difficulty.TheLowerGap)
.setPrice(new Price().setCost("Funds", 100), 1)
.setPrice(new Price().setCost("Funds", 545), 2)
.setPrice(new Price().setCost("Funds", 1450), 3)
.addPlaceableArea("BarrenIslands")

.setDroplet(Droplet.FatDroplet)
.setDropRate(1);