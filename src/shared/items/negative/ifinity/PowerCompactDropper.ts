import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";
import DepressingDropper from "./DepressingDropper";

export = new Dropper(script.Name)
.setName("Power Compact Dropper")
.setDescription("You may have already realized, but you can't sell items back. Do you want Funds, or a dropper producing %val% droplets per second?")
.setDifficulty(Difficulty.Ifinity)
.setPrice(new Price().setCost("Power", 1), 1)
.setRequiredItemAmount(DepressingDropper, 1)

.addPlaceableArea("BarrenIslands")
.setDroplet(Droplet.PowerCompactDroplet)
.setDropRate(1)