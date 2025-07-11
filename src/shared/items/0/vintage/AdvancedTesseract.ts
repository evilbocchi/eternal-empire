import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Generator from "shared/item/Generator";

export = new Generator(script.Name)
.setName("Advanced Tesseract")
.setDescription("Apparently taps into the fifth dimension to produce %gain%. Don't let that smile deceive you, it has connections with the underworld.")
.setDifficulty(Difficulty.Vintage)
.setPrice(new Price().setCost("Funds", 600e27).setCost("Skill", 35), 1)
.setPrice(new Price().setCost("Funds", 1.2e30).setCost("Skill", 35), 2)
.setPrice(new Price().setCost("Funds", 2.4e30).setCost("Skill", 35), 3)
.addPlaceableArea("SlamoVillage")

.setPassiveGain(new Price().setCost("Dark Matter", 2507331))
.ambienceSound((model) => (model.WaitForChild("Hitbox").WaitForChild("Sound") as Sound));