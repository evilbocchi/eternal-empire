import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";

export = new Dropper(script.Name)
.setName("Quadruple Coin Miner")
.setDescription("Produces %val% droplets per second. You really like producing Bitcoin, huh?")
.setDifficulty(Difficulty.JustAir)
.setPrice(new Price().setCost("Funds", 8e30).setCost("Skill", 20), 1)
.addPlaceableArea("BarrenIslands", "SlamoVillage")
.persists("Skillification")

.setDroplet(Droplet.QuadrupleCoin)
.setDropRate(1);