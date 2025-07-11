import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Furnace from "shared/item/Furnace";

export = new Furnace("ImprovedFurnace")
.setName("Improved Furnace")
.setDescription("An upgraded version of The First Furnace. Processes droplets for $2x more value.")
.setDifficulty(Difficulty.TheLowerGap)
.setPrice(new Price().setCost("Funds", 245), 1)
.addPlaceableArea(AREAS.BarrenIslands)

.setFormula((price) => price.mul(new Price().setCost("Funds", 2)));