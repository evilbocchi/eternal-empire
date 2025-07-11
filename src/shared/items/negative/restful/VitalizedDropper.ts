import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

export = new Dropper("VitalizedDropper")
.setName("Vitalized Dropper")
.setDescription("Produces $40K, 2K W/droplet/s with droplets having an extra 60 health!")
.setDifficulty(Difficulty.Restful)
.setPrice(new Price().setCost("Funds", new InfiniteMath([60, 18])).setCost("Power", new InfiniteMath([10, 9])), 1)
.setPrice(new Price().setCost("Funds", new InfiniteMath([240, 18])).setCost("Power", new InfiniteMath([35, 9])), 2)

.addPlaceableArea(AREAS.BarrenIslands)
.setDroplet(Droplet.VitalizedDroplet)
.setDropRate(1)