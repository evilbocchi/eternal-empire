import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Generator from "shared/item/Generator";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

export = new Generator("PeripheralGenerator")
.setName("Peripheral Generator")
.setDescription("Produces 15K W/s. We're getting somewhere now.")
.setDifficulty(Difficulty.ReversedPeripherality)
.setPrice(new Price().setCost("Funds", new InfiniteMath([201, 15])).setCost("Power", 26700000), 1)
.setPrice(new Price().setCost("Funds", new InfiniteMath([427, 15])).setCost("Power", 152000000), 2)
.setPrice(new Price().setCost("Funds", new InfiniteMath([870, 15])).setCost("Power", 371000000), 3)
.addPlaceableArea(AREAS.BarrenIslands)

.setPassiveGain(new Price().setCost("Power", 15000))
.ambienceSound((model) => (model.WaitForChild("Hitbox").WaitForChild("Sound") as Sound));