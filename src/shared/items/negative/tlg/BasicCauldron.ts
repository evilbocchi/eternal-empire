import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulties from "shared/difficulty/Difficulties";
import Furnace from "shared/item/Furnace";

export = new Furnace("BasicCauldron")
.setName("Basic Cauldron")
.setDescription("Able to process droplets for 25x more funds, but must be directly dropped into.")
.setDifficulty(Difficulties.TheLowerGap)
.setPrice(new Price().setCost("Funds", 5000), 1)
.addPlaceableArea(AREAS.BarrenIslands)

.setFormula((price) => price.mul(new Price().setCost("Funds", 25)));