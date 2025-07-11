import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Furnace from "shared/item/Furnace";

export = new Furnace("IndustrialFurnace")
.setName("Industrial Furnace")
.setDescription("You're nearing the age of Power. Scroll up the shop; The First Generator awaits you. Throwing that aside, this Furnace has a $250x boost.")
.setDifficulty(Difficulty.Friendliness)
.setPrice(new Price().setCost("Funds", 440000000), 1)
.addPlaceableArea(AREAS.BarrenIslands)

.setFormula((price) => price.mul(new Price().setCost("Funds", 250)));