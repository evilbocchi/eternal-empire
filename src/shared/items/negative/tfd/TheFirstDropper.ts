import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "@antivivi/jjt-difficulties";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";

export = new Dropper(script.Name)
.setName("The First Dropper")
.setDescription("Produces droplets. Place this dropper above a furnace to start earning some Funds.")
.setDifficulty(Difficulty.TheFirstDifficulty)
.setPrice(new Price().setCost("Funds", 0), 1)
.setPrice(new Price().setCost("Funds", 10), 2)
.setPrice(new Price().setCost("Funds", 55), 3)
.addPlaceableArea("BarrenIslands")

.setDroplet(Droplet.TheFirstDroplet)
.setDropRate(1);