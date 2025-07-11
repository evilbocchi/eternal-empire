import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulties from "shared/difficulty/Difficulties";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";

export = new Dropper("HeavyweightDropper")
.setName("Heavy-weight Dropper")
.setDescription("Despite the name, its build is actually quite modest. Produces $110/droplet/2s.")
.setDifficulty(Difficulties.Negativity)
.setPrice(new Price().setCost("Funds", 9000), 1)
.setPrice(new Price().setCost("Funds", 14000), 2)
.addPlaceableArea(AREAS.BarrenIslands)

.setDroplet(Droplet.HeavyweightDroplet)
.setDropRate(0.5);