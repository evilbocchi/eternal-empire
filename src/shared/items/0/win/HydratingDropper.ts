import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";

export = new Dropper(script.Name)
.setName("Hydrating Dropper")
.setDescription("Gotta stock up on that Power. Produces %val% droplets per second, with droplets having 130 HP.")
.setDifficulty(Difficulty.Win)
.setPrice(new Price().setCost("Power", 70e12), 1)
.setPrice(new Price().setCost("Power", 130e12), 2)
.setPrice(new Price().setCost("Power", 210e12), 3)

.addPlaceableArea("BarrenIslands")
.setDroplet(Droplet.HydratingDroplet)
.setDropRate(1)