import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";
import DepressingDropper from "./DepressingDropper";

export = new Dropper("PowerCompactDropper")
.setName("Power Compact Dropper")
.setDescription("You may have already realized, but you can't sell items back. Do you want Funds, or a dropper producing 6K W droplets per second?")
.setDifficulty(Difficulty.Ifinity)
.setPrice(new Price().setCost("Power", 1), 1)
.setRequiredItemAmount(DepressingDropper, 1)

.addPlaceableArea("BarrenIslands")
.setDroplet(Droplet.PowerCompactDroplet)
.setDropRate(1)