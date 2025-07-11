import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";

export = new Dropper("TheFirstDropper")
.setName("The First Dropper")
.setDescription("Produces droplets. Place this dropper above a furnace to start earning some Funds.")
.setDifficulty(Difficulty.TheFirstDifficulty)
.setPrice(new Price().setCost("Funds", 0), 1)
.setPrice(new Price().setCost("Funds", 10), 2)
.setPrice(new Price().setCost("Funds", 55), 3)
.addPlaceableArea(AREAS.BarrenIslands)

.setDroplet(Droplet.TheFirstDroplet)
.setDropRate(1);