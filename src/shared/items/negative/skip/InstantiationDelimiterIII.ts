import Difficulty from "@antivivi/jjt-difficulties";
import InstantiationDelimiter from "shared/item/InstantiationDelimiter";
import Price from "shared/Price";
import InstantiationDelimiterII from "../a/InstantiationDelimiterII";

export = new InstantiationDelimiter(script.Name)
.setName("Instantiation Delimiter III")
.setDescription("The Skip watches. Increases droplet limit by 75, at the cost of %drain%.")
.setDifficulty(Difficulty.Skip)
.setPrice(new Price().setCost("Funds", 27e18), 1)
.setRequiredItemAmount(InstantiationDelimiterII, 1)
.addPlaceableArea("BarrenIslands")

.setDropletIncrease(75)
.setDrain(new Price().setCost("Funds", 2e15));