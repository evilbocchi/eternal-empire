import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";
import DepressingDropper from "./DepressingDropper";

export = new Dropper("FundsCompactDropper")
.setName("Funds Compact Dropper")
.setDescription("Free! Just kidding. Go back and buy that Depressing Dropper for a dropper producing $100K/droplet/s.")
.setDifficulty(Difficulty.Ifinity)
.setPrice(new Price().setCost("Funds", 1), 1)
.setRequiredItemAmount(DepressingDropper, 1)

.addPlaceableArea(AREAS.BarrenIslands)
.setDroplet(Droplet.FundsCompactDroplet)
.setDropRate(1)