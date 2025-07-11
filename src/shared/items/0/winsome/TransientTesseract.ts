import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Generator from "shared/item/Generator";

export = new Generator("TransientTesseract")
.setName("Transient Tesseract")
.setDescription("Trying its best to exist... Produces +95 Dark Matter/s.")
.setDifficulty(Difficulty.Winsome)
.setPrice(new Price().setCost("Skill", 7), 1, 3)
.addPlaceableArea("BarrenIslands")

.setPassiveGain(new Price().setCost("Dark Matter", 95))
.ambienceSound((model) => (model.WaitForChild("Hitbox").WaitForChild("Sound") as Sound));