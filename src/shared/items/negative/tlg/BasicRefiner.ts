import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "@antivivi/jjt-difficulties";
import Upgrader from "shared/item/Upgrader";

export = new Upgrader(script.Name)
.setName("Basic Refiner")
.setDescription("A flag-like device used to refine droplets, increasing their value by %add%.")
.setDifficulty(Difficulty.TheLowerGap)
.setPrice(new Price().setCost("Funds", 1000), 1)
.setPrice(new Price().setCost("Funds", 3600), 2)
.setPrice(new Price().setCost("Funds", 12200), 3)
.setPrice(new Price().setCost("Funds", 50000), 4)
.setPrice(new Price().setCost("Funds", 225000), 5, 10)
.addPlaceableArea("BarrenIslands")

.setAdd(new Price().setCost("Funds", 10));