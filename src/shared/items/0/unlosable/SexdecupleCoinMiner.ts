import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";

export = new Dropper(script.Name)
.setName("Sexdecuple Coin Miner")
.setDescription("We are reaching slightly ridiculous names now. Produces %val% droplets per second. Your choice to harvest for Bitcoin or Skill...")
.setDifficulty(Difficulty.Unlosable)
.setPrice(new Price().setCost("Skill", 40000).setCost("Bitcoin", 500e6), 1)
.addPlaceableArea("BarrenIslands", "SlamoVillage")
.persists("Skillification")

.setDroplet(Droplet.SexdecupleCoin)
.setDropRate(1);