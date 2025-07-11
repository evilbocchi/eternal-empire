import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Generator from "shared/item/Generator";

export = new Generator(script.Name)
.setName("Improved Tesseract")
.setDescription("Just a tesseract doing its tesseract things for %gain%. Don't mind it, please.")
.setDifficulty(Difficulty.Win)
.setPrice(new Price().setCost("Skill", 4), 1)
.setPrice(new Price().setCost("Skill", 10), 2)
.addPlaceableArea("SlamoVillage")

.setPassiveGain(new Price().setCost("Dark Matter", 96))
.ambienceSound((model) => (model.WaitForChild("Hitbox").WaitForChild("Sound") as Sound));