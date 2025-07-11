import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Furnace from "shared/item/Furnace";

export = new Furnace("ButtonFurnace")
.setName("Button Furnace")
.setDescription("Doesn't actually press. Gives a sizeable $70x bonus though!")
.setDifficulty(Difficulty.Unimpossible)
.setPrice(new Price().setCost("Funds", 700000), 1)
.addPlaceableArea(AREAS.BarrenIslands)

.setFormula((price) => price.mul(new Price().setCost("Funds", 70)));