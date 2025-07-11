import Difficulty from "@antivivi/jjt-difficulties";
import Upgrader from "shared/item/Upgrader";
import Price from "shared/Price";

export = new Upgrader(script.Name)
.setName("Unleashed Sky Ramp")
.setDescription("After the creation of the Void Sky Upgrader, scientists realised what they had to do. After running 20 million tests attempting to copy its exact characteristics, this was the fruition of their results.")
.setDifficulty(Difficulty.Locomotion)
.setPrice(new Price().setCost("Skill", 6).setCost("Bitcoin", 20000), 1, 15)
.setPrice(new Price().setCost("Skill", 12).setCost("Bitcoin", 60000), 16, 30)
.addPlaceableArea("BarrenIslands", "SlamoVillage")
.persists("Skillification")
.setSky(true)
.setSpeed(9);