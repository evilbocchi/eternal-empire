import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import Condenser from "shared/item/Condenser";
import Droplet from "shared/item/Droplet";

export = new Condenser("StrongCondenser")
.setName("Strong Condenser")
.setDescription("Produces $30M and 5M W droplets when 40% of those values are processed through the attached furnace.")
.setDifficulty(Difficulty.Millisecondless)
.setPrice(new Price().setCost("Funds", 1.28e24), 1)

.addPlaceableArea("BarrenIslands")
.setDropletQuota(Droplet.LiquidestFundsDroplet, 0.4)
.setDropletQuota(Droplet.LiquidestPowerDroplet, 0.4);