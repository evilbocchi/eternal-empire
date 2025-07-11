import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";
import { PowerHarvester } from "shared/item/Special";

export = new Dropper(script.Name)
.setName("Coin Miner")
.setDescription("Start producing Bitcoin with %val% droplets per second.")
.setDifficulty(Difficulty.Winsome)
.setPrice(new Price().setCost("Funds", 20e24).setCost("Power", 305e12), 1)

.addPlaceableArea("BarrenIslands", "SlamoVillage")
.persists("Skillification")
.setDroplet(Droplet.BasicCoin)
.setDropRate(1)
.onClientLoad((model) => PowerHarvester.spin(model));