import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Condenser from "shared/item/Condenser";
import Droplet from "shared/item/Droplet";
import AdvancedCondenser from "shared/items/negative/skip/AdvancedCondenser";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

export = new Condenser("StrongCondenser")
.setName("Strong Condenser")
.setDescription("Quite an upgrade! Produces $30M and 5M W droplets when 40% of those values are processed through the attached furnace.")
.setDifficulty(Difficulty.Millisecondless)
.setPrice(new Price().setCost("Funds", new InfiniteMath([1.28, 24])), 1)
.setRequiredItemAmount(AdvancedCondenser, 1)

.addPlaceableArea(AREAS.BarrenIslands)
.setDropletQuota(Droplet.LiquidestFundsDroplet, 0.4)
.setDropletQuota(Droplet.LiquidestPowerDroplet, 0.4);