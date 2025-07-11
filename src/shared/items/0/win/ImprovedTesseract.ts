import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import Generator from "shared/item/Generator";

export = new Generator("ImprovedTesseract")
.setName("Improved Tesseract")
.setDescription("Just a tesseract doing its tesseract things for +22 Dark Matter/s. Don't mind it, please.")
.setDifficulty(Difficulty.Win)
.setPrice(new Price().setCost("Skill", 4), 1)
.setPrice(new Price().setCost("Skill", 10), 2)
.addPlaceableArea("SlamoVillage")

.setPassiveGain(new Price().setCost("Dark Matter", 22))
.ambienceSound((model) => (model.WaitForChild("Hitbox").WaitForChild("Sound") as Sound));