import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";

export = new Dropper(script.Name)
.setName("Double Coin Miner")
.setDescription("Produces %val% droplets per second. It's getting less and less desirable to skillificate now, huh?")
.setDifficulty(Difficulty.Blessing)
.setPrice(new Price().setCost("Funds", 20e27).setCost("Skill", 5), 1)

.addPlaceableArea("BarrenIslands", "SlamoVillage")
.persists("Skillification")
.setDroplet(Droplet.DoubleCoin)
.setDropRate(1);