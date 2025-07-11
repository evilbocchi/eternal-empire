import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Item from "shared/item/Item";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

export = new Item("BasicBlankEssence")
.setName("Basic Blank Essence")
.setDescription("A small piece of the Void, ready to manifest into whatever you choose.")
.setDifficulty(Difficulty.InstantWin)
.setPrice(new Price().setCost("Funds", new InfiniteMath([30, 21])).setCost("Power", new InfiniteMath([20, 12])).setCost("Purifier Clicks", 150000), 1)
.addPlaceableArea(AREAS.BarrenIslands)

.ambienceSound((model) => (model.WaitForChild("Hitbox").WaitForChild("Sound") as Sound));