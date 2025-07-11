import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import InstantiationDelimiter from "shared/item/InstantiationDelimiter";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";
import InstantiationDelimiterII from "../a/InstantiationDelimiterII";

export = new InstantiationDelimiter("InstantiationDelimiterIII")
.setName("Instantiation Delimiter III")
.setDescription("The Skip watches. Increases droplet limit by 75, at the cost of $2Qd/s.")
.setDifficulty(Difficulty.Skip)
.setPrice(new Price().setCost("Funds", new InfiniteMath([27, 18])), 1)
.setRequiredItemAmount(InstantiationDelimiterII, 1)
.addPlaceableArea(AREAS.BarrenIslands)

.setDropletIncrease(75)
.setMaintenance(new Price().setCost("Funds", new InfiniteMath([2, 15])));