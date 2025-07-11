import Difficulty from "@antivivi/jjt-difficulties";
import Condenser from "shared/item/Condenser";
import Droplet from "shared/item/Droplet";
import Price from "shared/Price";

export = new Condenser(script.Name)
.setName("Basic Condenser")
.setDescription("The successor to the Recycling Dropper. Produces %val% droplets when 50% of those values are processed through the attached furnace.")
.setDifficulty(Difficulty.FelixTheA)
.setPrice(new Price().setCost("Funds", 256e12), 1)

.addPlaceableArea("BarrenIslands")
.setDropletQuota(Droplet.LiquidFundsDroplet, 0.5)
.setDropletQuota(Droplet.LiquidPowerDroplet, 0.5);