import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Generator from "shared/item/Generator";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

export = new Generator("PassiveBonanza")
.setName("Passive Bonanza")
.setDescription("A chained beast waiting to be unleashed, producing 50M W/s.")
.setDifficulty(Difficulty.InstantWin)
.setPrice(new Price().setCost("Funds", new InfiniteMath([8.16, 21])).setCost("Power", new InfiniteMath([400, 9])), 1)
.addPlaceableArea(AREAS.BarrenIslands)

.setPassiveGain(new Price().setCost("Power", 50000000))
.ambienceSound((model) => (model.WaitForChild("Hitbox").WaitForChild("Sound") as Sound));