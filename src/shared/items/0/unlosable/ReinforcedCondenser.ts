import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Condenser from "shared/item/Condenser";
import Droplet from "shared/item/Droplet";

export = new Condenser(script.Name)
.setName("Reinforced Condenser")
.setDescription("Your droplet count is reaching extreme limits, and you don't want to craft another Limit Breaker. Produces %val% droplets when 35% of those values are processed through the attached furnace.")
.setDifficulty(Difficulty.Unlosable)
.setPrice(new Price().setCost("Funds", 30e36).setCost("Bitcoin", 1e9), 1)

.addPlaceableArea("BarrenIslands")
.setDropletQuota(Droplet.LiquidesterFundsDroplet, 0.35)
.setDropletQuota(Droplet.LiquidesterPowerDroplet, 0.35);