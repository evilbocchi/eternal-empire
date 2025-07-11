import Difficulty from "@antivivi/jjt-difficulties";
import Upgrader from "shared/item/Upgrader";
import Price from "shared/Price";

export = new Upgrader(script.Name)
.setName("Advanced Refiner")
.setDescription("Boosts droplets passing through this upgrader by %mul%.")
.setDifficulty(Difficulty.A)
.setPrice(new Price().setCost("Funds", 4.5e12), 1)
.setPrice(new Price().setCost("Funds", 8.1e12), 2)
.setPrice(new Price().setCost("Funds", 16.3e12), 3)
.addPlaceableArea("BarrenIslands")

.setMul(new Price().setCost("Funds", 1.75).setCost("Power", 1.75));