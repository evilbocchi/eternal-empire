import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Upgrader from "shared/item/Upgrader";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

export = new Upgrader("FrozenGate")
.setName("Frozen Gate")
.setDescription("The hands of time stay frozen for this elusive machinery, boosting Funds and Power droplet values by 4x.")
.setDifficulty(Difficulty.InstantWin)
.setPrice(new Price().setCost("Funds", new InfiniteMath([1.38, 21])), 1)
.addPlaceableArea(AREAS.BarrenIslands)

.setSpeed(2)
.setMul(new Price().setCost("Funds", 4).setCost("Power", 4));