import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulties from "shared/difficulty/Difficulties";
import InstantiationDelimiter from "shared/item/InstantiationDelimiter";

export = new InstantiationDelimiter("InstantiationDelimiterI")
.setName("Instantiation Delimiter I")
.setDescription("Increases droplet limit by 25, but uses $15/s.")
.setDifficulty(Difficulties.Negativity)
.setPrice(new Price().setCost("Funds", 100000), 1)
.addPlaceableArea(AREAS.BarrenIslands)

.setDropletIncrease(25)
.setMaintenance(new Price().setCost("Funds", 15));