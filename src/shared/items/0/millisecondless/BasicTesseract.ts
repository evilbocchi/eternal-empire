import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Generator from "shared/item/Generator";

export = new Generator(script.Name)
.setName("Basic Tesseract")
.setDescription("A generator that produces %gain%. You'll need to skillify for this!")
.setDifficulty(Difficulty.Millisecondless)
.setPrice(new Price().setCost("Skill", 1), 1)
.setPrice(new Price().setCost("Skill", 2), 2)
.setPrice(new Price().setCost("Skill", 4), 3)
.addPlaceableArea("SlamoVillage")

.setPassiveGain(new Price().setCost("Dark Matter", 1))
.ambienceSound((model) => (model.WaitForChild("Hitbox").WaitForChild("Sound") as Sound));