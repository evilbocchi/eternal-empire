import Difficulty from "@antivivi/jjt-difficulties";
import InstantiationDelimiter from "shared/item/InstantiationDelimiter";
import Price from "shared/Price";

export = new InstantiationDelimiter(script.Name)
.setName("Instantiation Delimiter V")
.setDescription("Increases droplet limit in Slamo Village by 25, at the cost of %drain%.")
.setDifficulty(Difficulty.Unlosable)
.setPrice(new Price().setCost("Skill", 100000), 1)
.addPlaceableArea("SlamoVillage")

.setDrain(new Price().setCost("Skill", 3))
.setDropletIncrease(25);