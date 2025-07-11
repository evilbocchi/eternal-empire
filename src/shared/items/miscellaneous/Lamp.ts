import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Item from "shared/item/Item";
import ExcavationStone from "shared/items/excavation/ExcavationStone";

export = new Item(script.Name)
.setName("Lamp")
.setDescription("Provides visibility at night.")
.setDifficulty(Difficulty.Miscellaneous)
.setPrice(new Price().setCost("Funds", 200))
.setRequiredItemAmount(ExcavationStone, 10)
.markPlaceableEverywhere();