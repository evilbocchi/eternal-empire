import Difficulty from "shared/Difficulty";
import Generator from "shared/item/Generator";
import Price from "shared/Price";
import { rainbowEffect } from "shared/utils/vrldk/BasePartUtils";

export = new Generator("UpgradedGenerator")
.setName("Upgraded Generator")
.setDescription("Let's work on that Power gain. Produces %gain%/s.")
.setDifficulty(Difficulty.TrueEase)
.setPrice(new Price().setCost("Funds", 205e9).setCost("Power", 3500), 1)
.setPrice(new Price().setCost("Funds", 1.32e12).setCost("Power", 6600), 2)
.addPlaceableArea("BarrenIslands")

.setPassiveGain(new Price().setCost("Power", 7).setCost("Funds", 2e9))
.ambienceSound((model) => (model.WaitForChild("Hitbox").WaitForChild("Sound") as Sound))
.onLoad((model) => rainbowEffect(model.WaitForChild("Color") as BasePart, 2));