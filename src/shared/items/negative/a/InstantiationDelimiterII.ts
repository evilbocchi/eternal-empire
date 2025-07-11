import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulties from "shared/difficulty/Difficulties";
import InstantiationDelimiter from "shared/item/InstantiationDelimiter";
import InstantiationDelimiterI from "../negativity/InstantiationDelimiterI";

export = new InstantiationDelimiter("InstantiationDelimiterII")
.setName("Instantiation Delimiter II")
.setDescription("Increases droplet limit by 50, at the cost of 15 W/s.")
.setDifficulty(Difficulties.A)
.setPrice(new Price().setCost("Power", 30000), 1)
.setRequiredItemAmount(InstantiationDelimiterI, 1)
.addPlaceableArea(AREAS.BarrenIslands)

.setDropletIncrease(50)
.setMaintenance(new Price().setCost("Power", 15));