import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Furnace from "shared/item/Furnace";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

export = new Furnace("SpatialFurnace")
.setName("Spatial Furnace")
.setDescription("A basic furnace placeable in Slamo Village.")
.setDifficulty(Difficulty.Astronomical)
.setPrice(new Price().setCost("Funds", new InfiniteMath([3, 24])), 1)
.addPlaceableArea(AREAS.SlamoVillage)

.setFormula((price) => price.mul(new Price().setCost("Funds", 1)));