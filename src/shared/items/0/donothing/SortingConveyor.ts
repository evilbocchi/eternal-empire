import Difficulty from "@antivivi/jjt-difficulties";
import Conveyor from "shared/item/Conveyor";
import ExcavationStone from "shared/items/excavation/ExcavationStone";
import WhiteGem from "shared/items/excavation/WhiteGem";
import Price from "shared/Price";

export = new Conveyor(script.Name)
.setName("Sorting Conveyor")
.setDescription("Sorts stuff... I don't know how this works either.")
.setDifficulty(Difficulty.DoNothing)
.setPrice(new Price().setCost("Funds", 8.2e27), 1)
.setRequiredItemAmount(WhiteGem, 40)
.setRequiredItemAmount(ExcavationStone, 20)
.setCreator("CoPKaDT")
.addPlaceableArea("BarrenIslands")
.persists()

.setSpeed(5);