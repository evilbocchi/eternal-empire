import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulties from "shared/difficulty/Difficulties";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";

export = new Dropper("BulkyDropper")
.setName("Bulky Dropper")
.setDescription("Takes a lot of space, but generates $4/droplet/s.")
.setDifficulty(Difficulties.TheLowerGap)
.setPrice(new Price().setCost("Funds", 100), 1)
.setPrice(new Price().setCost("Funds", 545), 2)
.setPrice(new Price().setCost("Funds", 1450), 3)
.addPlaceableArea(AREAS.BarrenIslands)

.setDroplet(Droplet.FatDroplet)
.setDropRate(1);