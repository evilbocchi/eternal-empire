import Difficulty from "@antivivi/jjt-difficulties";
import Generator from "shared/item/Generator";
import Price from "shared/Price";

export = new Generator(script.Name)
.setName("Peripheral Generator")
.setDescription("Produces %gain%. We're getting somewhere now.")
.setDifficulty(Difficulty.ReversedPeripherality)
.setPrice(new Price().setCost("Funds", 201e15).setCost("Power", 16700000), 1)
.setPrice(new Price().setCost("Funds", 427e15).setCost("Power", 152000000), 2)
.setPrice(new Price().setCost("Funds", 870e15).setCost("Power", 371000000), 3)
.addPlaceableArea("BarrenIslands")

.setPassiveGain(new Price().setCost("Power", 15000))
.ambienceSound((model) => (model.WaitForChild("Hitbox").WaitForChild("Sound") as Sound));