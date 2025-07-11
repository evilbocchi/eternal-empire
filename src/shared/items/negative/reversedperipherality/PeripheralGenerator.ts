import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulties from "shared/difficulty/Difficulties";
import Generator from "shared/item/Generator";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

export = new Generator("PeripheralGenerator")
.setName("Peripheral Generator")
.setDescription("Produces 15K W/s. We're getting somewhere now.")
.setDifficulty(Difficulties.ReversedPeripherality)
.setPrice(new Price().setCost("Funds", new InfiniteMath([101, 15])).setCost("Power", 2670000), 1)
.setPrice(new Price().setCost("Funds", new InfiniteMath([227, 15])).setCost("Power", 6200000), 2)
.setPrice(new Price().setCost("Funds", new InfiniteMath([470, 15])).setCost("Power", 17000000), 3)
.addPlaceableArea(AREAS.BarrenIslands)

.setPassiveGain(new Price().setCost("Power", 15000))
.ambienceSound((model) => (model.WaitForChild("Hitbox").WaitForChild("Sound") as Sound));