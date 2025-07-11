import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulties from "shared/difficulty/Difficulties";
import Generator from "shared/item/Generator";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";
import { rainbowEffect } from "shared/utils/vrldk/BasePartUtils";

export = new Generator("UpgradedGenerator")
.setName("Upgraded Generator")
.setDescription("Let's work on that Power gain. Produces 7 W/s and $2B/s on the side too.")
.setDifficulty(Difficulties.TrueEase)
.setPrice(new Price().setCost("Funds", new InfiniteMath([205, 9])).setCost("Power", 3500), 1)
.setPrice(new Price().setCost("Funds", new InfiniteMath([1.32, 12])).setCost("Power", 6600), 2)
.addPlaceableArea(AREAS.BarrenIslands)

.setPassiveGain(new Price().setCost("Power", 7).setCost("Funds", new InfiniteMath([2, 9])))
.ambienceSound((model) => (model.WaitForChild("Hitbox").WaitForChild("Sound") as Sound))
.onLoad((model) => rainbowEffect(model.WaitForChild("Color") as BasePart, 2));