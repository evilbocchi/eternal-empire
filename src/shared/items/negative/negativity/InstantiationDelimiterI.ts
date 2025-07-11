import Difficulty from "shared/Difficulty";
import InstantiationDelimiter from "shared/item/InstantiationDelimiter";
import Price from "shared/Price";

export = new InstantiationDelimiter("InstantiationDelimiterI")
.setName("Instantiation Delimiter I")
.setDescription("Increases droplet limit by 25, but uses %drain%/s.")
.setDifficulty(Difficulty.Negativity)
.setPrice(new Price().setCost("Funds", 100000), 1)
.addPlaceableArea("BarrenIslands")

.setDropletIncrease(25)
.setDrain(new Price().setCost("Funds", 15));