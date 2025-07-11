import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Furnace from "shared/item/Furnace";

export = new Furnace("VolatileCauldron")
.setName("Volatile Cauldron")
.setDescription("A cauldron giving... some multiplier of Funds? I don't know.")
.setDifficulty(Difficulty.Unimpossible)
.setPrice(new Price().setCost("Funds", 700000), 1)
.addPlaceableArea(AREAS.BarrenIslands)
.acceptsUpgrades(false)

.setFormula((price) => price.mul(new Price().setCost("Funds", 225)))
.setVariance(0.4);