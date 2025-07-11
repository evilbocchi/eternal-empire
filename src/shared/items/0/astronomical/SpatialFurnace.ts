import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import Furnace from "shared/item/Furnace";
import { OnoeNum } from "@antivivi/serikanum";

export = new Furnace("SpatialFurnace")
.setName("Spatial Furnace")
.setDescription("A basic furnace placeable in Slamo Village.")
.setDifficulty(Difficulty.Astronomical)
.setPrice(new Price().setCost("Funds", 3e24), 1)
.addPlaceableArea("SlamoVillage")

.setMul(new Price().setCost("Funds", 1));