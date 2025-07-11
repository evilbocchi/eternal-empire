import Difficulty from "@antivivi/jjt-difficulties";
import Upgrader from "shared/item/Upgrader";
import Price from "shared/Price";

export = new Upgrader(script.Name)
.setName("Precision Refiner")
.setDescription("A thin laser requiring utmost precision to upgrade droplets for %mul% value.")
.setDifficulty(Difficulty.Relax)
.setPrice(new Price().setCost("Funds", 5e18), 1)
.setPrice(new Price().setCost("Funds", 11e18), 2)
.addPlaceableArea("BarrenIslands")

.setMul(new Price().setCost("Funds", 2));