import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Furnace from "shared/item/Furnace";

export = new Furnace("BasicCauldron")
.setName("Basic Cauldron")
.setDescription("Able to process droplets for 25x more funds, but must be directly dropped into.")
.setDifficulty(Difficulty.TheLowerGap)
.setPrice(new Price().setCost("Funds", 5000), 1)
.addPlaceableArea(AREAS.BarrenIslands)
.acceptsUpgrades(false)

.setFormula((price) => price.mul(new Price().setCost("Funds", 25)));