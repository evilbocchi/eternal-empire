import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulties from "shared/difficulty/Difficulties";
import Furnace from "shared/item/Furnace";

export = new Furnace("TheFirstFurnace")
.setName("The First Furnace")
.setDescription("Processes droplets, turning them into liquid currency.")
.setDifficulty(Difficulties.TheFirstDifficulty)
.setPrice(new Price().setCost("Funds", 0), 1)
.addPlaceableArea(AREAS.BarrenIslands)

.setFormula((price) => price.mul(new Price().setCost("Funds", 1)));