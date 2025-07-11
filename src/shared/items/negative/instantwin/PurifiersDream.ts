import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/Dropper";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

export = new Dropper("PurifiersDream")
.setName("Purifiers' Dream")
.setDescription("An unfounded treasure meant solely for the mastery of purification, producing 200 Purifier Clicks/droplet/2s.")
.setDifficulty(Difficulty.InstantWin)
.setPrice(new Price().setCost("Funds", new InfiniteMath([9.9, 21])).setCost("Purifier Clicks", 8000), 1)
.addPlaceableArea(AREAS.BarrenIslands)

.setDroplet(Droplet.PurifiersDroplet)
.setDropRate(0.5);