import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulties from "shared/difficulty/Difficulties";
import Furnace from "shared/item/Furnace";

export = new Furnace("IndustrialFurnace")
.setName("Industrial Furnace")
.setDescription("You're nearing the age of Power. Scroll up the shop; The First Generator awaits you. Throwing that aside, this Furnace has a $250x boost.")
.setDifficulty(Difficulties.Friendliness)
.setPrice(new Price().setCost("Funds", 440000000), 1)
.addPlaceableArea(AREAS.BarrenIslands)

.setFormula((price) => price.mul(new Price().setCost("Funds", 250)));