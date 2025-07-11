import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Generator from "shared/item/Generator";

export = new Generator("BasicTesseract")
.setName("Basic Tesseract")
.setDescription("A generator that produces +1 Dark Matter/s. You'll need to Skillify for this!")
.setDifficulty(Difficulty.Millisecondless)
.setPrice(new Price().setCost("Skill", 1), 1)
.setPrice(new Price().setCost("Skill", 2), 2)
.setPrice(new Price().setCost("Skill", 4), 3)
.addPlaceableArea(AREAS.SlamoVillage)

.setPassiveGain(new Price().setCost("Dark Matter", 1))
.ambienceSound((model) => (model.WaitForChild("Hitbox").WaitForChild("Sound") as Sound));