import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Upgrader from "shared/item/Upgrader";

export = new Upgrader("DirectDropletWasher")
.setName("Direct Droplet Washer")
.setDescription("Upgrades droplets dropped directly above it for a $55 gain.")
.setDifficulty(Difficulty.Negativity)
.setPrice(new Price().setCost("Funds", 25000), 1)
.setPrice(new Price().setCost("Funds", 30000), 2)
.setPrice(new Price().setCost("Funds", 40000), 3)
.setPrice(new Price().setCost("Funds", 60000), 4)
.setPrice(new Price().setCost("Funds", 100000), 5, 9)
.setPrice(new Price().setCost("Funds", 200000), 10, 20)
.addPlaceableArea(AREAS.BarrenIslands)

.setAdd(new Price().setCost("Funds", 55));