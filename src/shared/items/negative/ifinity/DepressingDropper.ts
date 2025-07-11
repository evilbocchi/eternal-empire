import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

export = new Dropper("DepressingDropper")
.setName("Depressing Dropper")
.setDescription("The best item in the game. Produces $0.01/droplet/s.")
.setDifficulty(Difficulty.Ifinity)
.setPrice(new Price().setCost("Funds", new InfiniteMath([450, 18])), 1)
.setPrice(new Price().setCost("Funds", new InfiniteMath([4.5, 21])), 2)

.addPlaceableArea(AREAS.BarrenIslands)
.setDroplet(Droplet.DepressingDroplet)
.setDropRate(1)