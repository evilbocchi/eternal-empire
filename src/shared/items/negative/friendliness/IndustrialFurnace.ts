import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Furnace from "shared/item/Furnace";

export = new Furnace("IndustrialFurnace")
.setName("Industrial Furnace")
.setDescription("A solid furnace, boasting an amazing %mul%x boost.")
.setDifficulty(Difficulty.Friendliness)
.setPrice(new Price().setCost("Funds", 440000000), 1)
.addPlaceableArea("BarrenIslands")

.setMul(new Price().setCost("Funds", 250));