import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Upgrader from "shared/item/Upgrader";
import ExcavationStone from "shared/items/excavation/ExcavationStone";
import WhiteGem from "shared/items/excavation/WhiteGem";

export = new Upgrader(script.Name)
.setName("Industrial Overpass")
.setDescription("A convoluted cross-over. Both lasers add %add% in droplet value.")
.setDifficulty(Difficulty.Miscellaneous)
.setPrice(new Price().setCost("Power", 200))
.setRequiredItemAmount(ExcavationStone, 30)
.setRequiredItemAmount(WhiteGem, 15)
.addPlaceableArea("BarrenIslands")
.setCreator("simple13579")

.setSpeed(3)
.setAdd(new Price().setCost("Power", 5));