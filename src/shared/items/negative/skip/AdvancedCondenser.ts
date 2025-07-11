import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Condenser from "shared/item/Condenser";
import Droplet from "shared/item/Droplet";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";
import BasicCondenser from "../felixthea/BasicCondenser";

export = new Condenser("AdvancedCondenser")
.setName("Advanced Condenser")
.setDescription("Produces $3M and 100K W droplets when 45% of those values are processed through the attached furnace.")
.setDifficulty(Difficulty.Skip)
.setPrice(new Price().setCost("Funds", new InfiniteMath([19.9, 18])), 1)
.setRequiredItemAmount(BasicCondenser, 1)

.addPlaceableArea(AREAS.BarrenIslands)
.setDropletQuota(Droplet.LiquiderFundsDroplet, 0.45)
.setDropletQuota(Droplet.LiquiderPowerDroplet, 0.45);