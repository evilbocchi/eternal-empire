import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "@antivivi/jjt-difficulties";
import Furnace from "shared/item/Furnace";

export = new Furnace(script.Name)
.setName("Button Furnace")
.setDescription("Doesn't actually press. Gives a sizeable %mul% bonus though.")
.setDifficulty(Difficulty.Unimpossible)
.setPrice(new Price().setCost("Funds", 700000), 1)
.addPlaceableArea("BarrenIslands")

.setMul(new Price().setCost("Funds", 70));