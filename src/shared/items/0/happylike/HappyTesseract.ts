import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Generator from "shared/item/Generator";

export = new Generator(script.Name)
.setName("'Happy' Tesseract")
.setDescription("That smile... It has spiralled out of control. It's menacing. Trying to find any opening to catch you. Produces %gain%.")
.setDifficulty(Difficulty.Happylike)
.setPrice(new Price().setCost("Funds", 1e33).setCost("Skill", 90), 1)
.addPlaceableArea("SlamoVillage")

.setPassiveGain(new Price().setCost("Dark Matter", 11.4e9))
.ambienceSound((model) => (model.WaitForChild("Hitbox").WaitForChild("Sound") as Sound));