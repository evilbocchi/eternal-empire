import Difficulty from "@antivivi/jjt-difficulties";
import Conveyor from "shared/item/Conveyor";
import Price from "shared/Price";

export = new Conveyor(script.Name)
.setName("Unleashed Anti-clockwise Conveyor Corner")
.setDescription("The OSC went a little crazy this time with the naming scheme... I wonder how many times they can get away with copying and pasting the same theme over and over?")
.setDifficulty(Difficulty.Locomotion)
.setPrice(new Price().setCost("Power", 4e15), 1, 30)
.addPlaceableArea("BarrenIslands", "SlamoVillage")
.persists("Skillification")

.setSpeed(9);