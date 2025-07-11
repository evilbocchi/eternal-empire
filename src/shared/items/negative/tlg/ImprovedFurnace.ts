import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "@antivivi/jjt-difficulties";
import Furnace from "shared/item/Furnace";

export = new Furnace(script.Name)
.setName("Improved Furnace")
.setDescription("An upgraded version of The First Furnace. Processes droplets for %mul% more value.")
.setDifficulty(Difficulty.TheLowerGap)
.setPrice(new Price().setCost("Funds", 245), 1)
.addPlaceableArea("BarrenIslands")

.setMul(new Price().setCost("Funds", 2));