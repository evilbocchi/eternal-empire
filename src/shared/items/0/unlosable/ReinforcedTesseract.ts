import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Generator from "shared/item/Generator";

export = new Generator(script.Name)
.setName("Reinforced Tesseract")
.setDescription("Scientists are still trying to figure out what qualifies as a tesseract. Against all odds, this particular piece of machinery produces an absurd %gain%.")
.setDifficulty(Difficulty.Unlosable)
.setPrice(new Price().setCost("Funds", 60e36).setCost("Power", 10e21).setCost("Skill", 90000).setCost("Dark Matter", 70e9), 1)
.addPlaceableArea("SlamoVillage")

.setPassiveGain(new Price().setCost("Dark Matter", 1.7e15))
.ambienceSound((model) => (model.WaitForChild("Hitbox").WaitForChild("Sound") as Sound));