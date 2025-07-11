import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";

export = new Dropper(script.Name)
.setName("Octuple Coin Miner")
.setDescription("Produces %val% droplets per second. We love Bitcoin.")
.setDifficulty(Difficulty.AutomaticJoyful)
.setPrice(new Price().setCost("Funds", 8e36).setCost("Skill", 2000).setCost("Bitcoin", 20000000), 1)
.addPlaceableArea("BarrenIslands", "SlamoVillage")
.persists("Skillification")

.setDroplet(Droplet.OctupleCoin)
.setDropRate(1);