import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";

export = new Dropper("HeavyweightDropper")
.setName("Heavy-weight Dropper")
.setDescription("Despite the name, its build is actually quite modest. Produces %val% droplets every 2 seconds.")
.setDifficulty(Difficulty.Negativity)
.setPrice(new Price().setCost("Funds", 9000), 1)
.setPrice(new Price().setCost("Funds", 14000), 2)
.addPlaceableArea("BarrenIslands")

.setDroplet(Droplet.HeavyweightDroplet)
.setDropRate(0.5);