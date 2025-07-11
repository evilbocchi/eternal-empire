import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

export = new Dropper("DualDropper")
.setName("Dual Dropper")
.setDescription("One day, a scientist realised that using the power of A, they could communize anything - and that included droppers. Thus, this amalgamation was born: one side producing $3.6K droplets, the other producing 4 W droplets, both per second.")
.setDifficulty(Difficulty.A)
.setPrice(new Price().setCost("Funds", new InfiniteMath([2.78, 12])), 1)
.setPrice(new Price().setCost("Funds", new InfiniteMath([4.1, 12])), 2)

.addPlaceableArea(AREAS.BarrenIslands)
.setDroplet(Droplet.CommunismFundsDroplet)
.setDroplet(Droplet.CommunismPowerDroplet, "PowerDrop")
.setDropRate(1);