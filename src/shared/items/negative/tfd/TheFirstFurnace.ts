import Difficulty from "shared/Difficulty";
import Furnace from "shared/item/Furnace";
import Price from "shared/Price";

export = new Furnace("TheFirstFurnace")
.setName("The First Furnace")
.setDescription("Processes droplets, turning them into liquid currency.")
.setDifficulty(Difficulty.TheFirstDifficulty)
.setPrice(new Price().setCost("Funds", 0), 1)
.addPlaceableArea("BarrenIslands")

.setMul(new Price().setCost("Funds", 1));