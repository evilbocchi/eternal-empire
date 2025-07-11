import Difficulty from "@antivivi/jjt-difficulties";
import Upgrader from "shared/item/Upgrader";
import Price from "shared/Price";

export = new Upgrader(script.Name)
.setName("Reversed Upgrader")
.setDescription("An elevated upgrader that does not appreciate Power, boosting Funds by x2 but nerfing Power by x0.5 in droplet value.")
.setDifficulty(Difficulty.ReversedPeripherality)
.setPrice(new Price().setCost("Funds", 1.45e18), 1)
.addPlaceableArea("BarrenIslands")
.setCreator("CoPKaDT")

.setSpeed(5)
.setMul(new Price().setCost("Funds", 2).setCost("Power", 0.5));