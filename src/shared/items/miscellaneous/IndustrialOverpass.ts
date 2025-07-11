import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import Upgrader from "shared/item/Upgrader";
import ExcavationStone from "shared/items/excavation/ExcavationStone";
import WhiteGem from "shared/items/excavation/WhiteGem";

export = new Upgrader("IndustrialOverpass")
.setName("Industrial Overpass")
.setDescription("A convoluted cross-over. Both lasers add 5 W in droplet value.")
.setDifficulty(Difficulty.Miscellaneous)
.setPrice(new Price().setCost("Power", 200))
.setRequiredItemAmount(ExcavationStone, 30)
.setRequiredItemAmount(WhiteGem, 15)
.addPlaceableArea("BarrenIslands")
.setCreator("simple13579")

.setSpeed(3)
.setAdd(new Price().setCost("Power", 5));