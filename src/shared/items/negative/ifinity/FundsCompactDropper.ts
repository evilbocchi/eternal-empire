import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";
import DepressingDropper from "./DepressingDropper";

export = new Dropper(script.Name)
.setName("Funds Compact Dropper")
.setDescription("Free! Just kidding. Go back and buy that Depressing Dropper for a dropper producing %val% droplets per second.")
.setDifficulty(Difficulty.Ifinity)
.setPrice(new Price().setCost("Funds", 1), 1)
.setRequiredItemAmount(DepressingDropper, 1)

.addPlaceableArea("BarrenIslands")
.setDroplet(Droplet.FundsCompactDroplet)
.setDropRate(1)