import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulties from "shared/difficulty/Difficulties";
import Furnace from "shared/item/Furnace";

export = new Furnace("VolatileCauldron")
.setName("Volatile Cauldron")
.setDescription("A cauldron giving... some multiplier of Funds? I don't know.")
.setDifficulty(Difficulties.Unimpossible)
.setPrice(new Price().setCost("Funds", 700000), 1)
.addPlaceableArea(AREAS.BarrenIslands)

.setFormula((price) => price.mul(new Price().setCost("Funds", 225)))
.setVariance(0.4);