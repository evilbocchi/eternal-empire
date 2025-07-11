import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

export = new Dropper("OverusedAmethystDropper")
.setName("Overused Amethyst Dropper")
.setDescription("Once used by the ancient Slamos in 700 B, this droplet still holds up and produces $34K/droplet/s.")
.setDifficulty(Difficulty.ReversedPeripherality)
.setPrice(new Price().setCost("Funds", new InfiniteMath([14, 15])).setCost("Power", 7400000), 1)
.setPrice(new Price().setCost("Funds", new InfiniteMath([34, 15])).setCost("Power", 15200000), 2)

.addPlaceableArea(AREAS.BarrenIslands)
.setDroplet(Droplet.RustyAmethystDroplet)
.setDropRate(1)