import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import InstantiationDelimiter from "shared/item/InstantiationDelimiter";
import InstantiationDelimiterI from "../negativity/InstantiationDelimiterI";

export = new InstantiationDelimiter(script.Name)
.setName("Instantiation Delimiter II")
.setDescription("Increases droplet limit by 50, at the cost of %drain%.")
.setDifficulty(Difficulty.A)
.setPrice(new Price().setCost("Power", 30000), 1)
.setRequiredItemAmount(InstantiationDelimiterI, 1)
.addPlaceableArea("BarrenIslands")

.setDropletIncrease(50)
.setDrain(new Price().setCost("Power", 15));