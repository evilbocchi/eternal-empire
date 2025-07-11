import Difficulty from "@antivivi/jjt-difficulties";
import Generator from "shared/item/Generator";
import Price from "shared/Price";

export = new Generator(script.Name)
.setName("Passive Bonanza")
.setDescription("A chained beast waiting to be unleashed, producing %gain%.")
.setDifficulty(Difficulty.InstantWin)
.setPrice(new Price().setCost("Funds", 8.16e21).setCost("Power", 400e9), 1)
.addPlaceableArea("BarrenIslands")

.setPassiveGain(new Price().setCost("Power", 50000000))
.ambienceSound((model) => (model.WaitForChild("Hitbox").WaitForChild("Sound") as Sound));