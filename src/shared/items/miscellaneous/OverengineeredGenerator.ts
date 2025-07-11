import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Generator from "shared/item/Generator";
import ExcavationStone from "shared/items/excavation/ExcavationStone";
import WhiteGem from "shared/items/excavation/WhiteGem";

export = new Generator(script.Name)
.setName("Over-engineered Generator")
.setDescription("Unnecessarily bulky, but produces a worth-while %gain%.")
.setDifficulty(Difficulty.Miscellaneous)
.setPrice(new Price().setCost("Funds", 1e9))
.setRequiredItemAmount(ExcavationStone, 40)
.setRequiredItemAmount(WhiteGem, 8)
.addPlaceableArea("BarrenIslands")

.setPassiveGain(new Price().setCost("Power", 15))
.ambienceSound((model) => (model.WaitForChild("Hitbox").WaitForChild("Sound") as Sound));