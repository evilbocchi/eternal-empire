import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";

export = new Dropper("HydratingDropper")
.setName("Hydrating Dropper")
.setDescription("Gotta stock up on that Power. Produces 8K W droplets per second, with droplets having 130 HP.")
.setDifficulty(Difficulty.Win)
.setPrice(new Price().setCost("Power", 100e12), 1)
.setPrice(new Price().setCost("Power", 210e12), 2)

.addPlaceableArea("BarrenIslands")
.setDroplet(Droplet.HydratingDroplet)
.setDropRate(1)