import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import Condenser from "shared/item/Condenser";
import Droplet from "shared/item/Droplet";

export = new Condenser("AdvancedCondenser")
.setName("Advanced Condenser")
.setDescription("Produces $3M and 100K W droplets when 45% of those values are processed through the attached furnace. Droplets can only be condensed once.")
.setDifficulty(Difficulty.Skip)
.setPrice(new Price().setCost("Funds", 19.9e18), 1)

.addPlaceableArea("BarrenIslands")
.setDropletQuota(Droplet.LiquiderFundsDroplet, 0.45)
.setDropletQuota(Droplet.LiquiderPowerDroplet, 0.45);