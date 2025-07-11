import Difficulty from "@antivivi/jjt-difficulties";
import InstantiationDelimiter from "shared/item/InstantiationDelimiter";
import Price from "shared/Price";

export = new InstantiationDelimiter(script.Name)
.setName("Instantiation Delimiter I")
.setDescription("Increases droplet limit by 25, but uses %drain%.")
.setDifficulty(Difficulty.Negativity)
.setPrice(new Price().setCost("Funds", 100000), 1)
.addPlaceableArea("BarrenIslands")

.setDropletIncrease(25)
.setDrain(new Price().setCost("Funds", 15));