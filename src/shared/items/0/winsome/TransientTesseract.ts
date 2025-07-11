import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Generator from "shared/item/Generator";

export = new Generator(script.Name)
.setName("Transient Tesseract")
.setDescription("Trying its best to exist... Produces %gain%.")
.setDifficulty(Difficulty.Winsome)
.setPrice(new Price().setCost("Skill", 7), 1, 3)
.addPlaceableArea("BarrenIslands")

.setPassiveGain(new Price().setCost("Dark Matter", 6496))
.ambienceSound((model) => (model.WaitForChild("Hitbox").WaitForChild("Sound") as Sound));