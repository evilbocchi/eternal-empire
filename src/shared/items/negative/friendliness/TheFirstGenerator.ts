import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Generator from "shared/item/Generator";

export = new Generator("TheFirstGenerator")
.setName("Basic Generator")
.setDescription("Start producing Power at +1 W/s.")
.setDifficulty(Difficulty.Friendliness)
.setPrice(new Price().setCost("Funds", 1000000000), 1)
.setPrice(new Price().setCost("Funds", 1450000000).setCost("Power", 50), 2)
.setPrice(new Price().setCost("Funds", 3000000000).setCost("Power", 250), 3)
.setPrice(new Price().setCost("Funds", 42200000000).setCost("Power", 1200), 4)        
.addPlaceableArea("BarrenIslands")

.setPassiveGain(new Price().setCost("Power", 1))
.ambienceSound((model) => (model.WaitForChild("Hitbox").WaitForChild("Sound") as Sound));