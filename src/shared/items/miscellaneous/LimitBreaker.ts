import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import InstantiationDelimiter from "shared/item/InstantiationDelimiter";
import ExcavationStone from "shared/items/excavation/ExcavationStone";

export = new InstantiationDelimiter("LimitBreaker")
.setName("Limit Breaker")
.setDescription("A massive structure made to delimit. Sustains itself, increasing droplet limit by 20 at no cost.")
.setDifficulty(Difficulty.Miscellaneous)
.setPrice(new Price().setCost("Funds", 10000000))
.setRequiredItemAmount(ExcavationStone, 50)
.addPlaceableArea("BarrenIslands")
.setCreator("Trabitic")

.setDropletIncrease(20);