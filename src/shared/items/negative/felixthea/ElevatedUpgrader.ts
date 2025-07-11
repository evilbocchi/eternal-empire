import Difficulty from "@antivivi/jjt-difficulties";
import Upgrader from "shared/item/Upgrader";
import Price from "shared/Price";

export = new Upgrader(script.Name)
.setName("Elevated Upgrader")
.setDescription("A little high... Increases droplet value by %mul%.")
.setDifficulty(Difficulty.FelixTheA)
.setPrice(new Price().setCost("Funds", 25e12), 1)
.addPlaceableArea("BarrenIslands")

.setSpeed(5)
.setMul(new Price().setCost("Funds", 2));