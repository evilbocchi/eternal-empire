import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Furnace from "shared/item/Furnace";


export = new Furnace("PurifyingCauldron")
.setName("Purifying Cauldron")
.setDescription("A massive %mul%x boost... and a massive price tag with it.")
.setDifficulty(Difficulty.Winsome)
.setPrice(new Price().setCost("Dark Matter", 3600), 1)
.addPlaceableArea("BarrenIslands")

.setMul(new Price().setCost("Purifier Clicks", 5));