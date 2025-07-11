import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import Conveyor from "shared/item/Conveyor";
import ExcavationStone from "shared/items/excavation/ExcavationStone";
import WhiteGem from "shared/items/excavation/WhiteGem";

export = new Conveyor("DropletDiverger")
.setName("Droplet Diverger")
.setDescription("Used to separate stuff. Not sure why you would need this.")
.setDifficulty(Difficulty.Miscellaneous)
.setPrice(new Price().setCost("Bitcoin", 10))
.setRequiredItemAmount(ExcavationStone, 20)
.setRequiredItemAmount(WhiteGem, 2)
.addPlaceableArea("BarrenIslands")
.setCreator("Alexanderloney")

.setSpeed(4);