import Difficulty from "@antivivi/jjt-difficulties";
import { OmniUpgrader } from "shared/item/Special";
import ExcavationStone from "shared/items/excavation/ExcavationStone";
import WhiteGem from "shared/items/excavation/WhiteGem";
import Price from "shared/Price";

export = new OmniUpgrader(script.Name)
.setName("Sideswiper")
.setDescription("A compact little gadget for some moderate gains! The blue laser gives a Bitcoin boost while the yellow laser gives a Power boost, adding up to %add%.")
.setDifficulty(Difficulty.Miscellaneous)
.setPrice(new Price().setCost("Bitcoin", 200))
.setRequiredItemAmount(ExcavationStone, 30)
.setRequiredItemAmount(WhiteGem, 25)
.addPlaceableArea("BarrenIslands")
.setCreator("goog_als")

.setAdds(new Map([
    ["BitcoinLaser", new Price().setCost("Bitcoin", 1)],
    ["PowerLaser", new Price().setCost("Power", 4000)],
]))
.setAdd(new Price().setCost("Power", 4000).setCost("Bitcoin", 0.75));