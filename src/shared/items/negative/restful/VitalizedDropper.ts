import Difficulty from "shared/Difficulty";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";
import Price from "shared/Price";

export = new Dropper("VitalizedDropper")
.setName("Vitalized Dropper")
.setDescription("Produces $40K, 2K W droplets per second with droplets having an extra 40 health.")
.setDifficulty(Difficulty.Restful)
.setPrice(new Price().setCost("Funds", 60e18).setCost("Power", 10e9), 1)
.setPrice(new Price().setCost("Funds", 240e18).setCost("Power", 35e9), 2)

.addPlaceableArea("BarrenIslands")
.setDroplet(Droplet.VitalizedDroplet)
.setDropRate(1)