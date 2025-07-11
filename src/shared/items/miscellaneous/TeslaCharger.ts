import Difficulty from "@antivivi/jjt-difficulties";
import Charger from "shared/item/Charger";
import ExcavationStone from "shared/items/excavation/ExcavationStone";
import WhiteGem from "shared/items/excavation/WhiteGem";
import Price from "shared/Price";

export = new Charger(script.Name)
.setName("Tesla Charger")
.setDescription("Boosts Power gain of generators within 9 studs radius of this charger by 2.5x.")
.setDifficulty(Difficulty.Miscellaneous)
.setRequiredItemAmount(ExcavationStone, 20)
.setRequiredItemAmount(WhiteGem, 15)
.setPrice(new Price().setCost("Power", 1000))
.addPlaceableArea("BarrenIslands")
.setCreator("simple13579")

.setRadius(9)
.setMul(new Price().setCost("Power", 2.5));