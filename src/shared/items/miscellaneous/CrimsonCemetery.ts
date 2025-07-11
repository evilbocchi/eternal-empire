import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import { Killbrick } from "shared/item/Special";
import ExcavationStone from "shared/items/excavation/ExcavationStone";
import Gold from "shared/items/excavation/Gold";
import WhiteGem from "shared/items/excavation/WhiteGem";

export = new Killbrick.KillbrickUpgrader(script.Name)
.setName("Crimson Cemetery")
.setDescription("A bloody moon dyes a forgotten cemetery in crimson red. Deals 30 damage to droplets for a %mul% gain, though space constraints may pose a challenge...")
.setDifficulty(Difficulty.Miscellaneous)
.setPrice(new Price().setCost("Power", 2e21))
.setRequiredItemAmount(ExcavationStone, 500)
.setRequiredItemAmount(WhiteGem, 150)
.setRequiredItemAmount(Gold, 3)
.addPlaceableArea("BarrenIslands")
.setCreator("CoPKaDT")

.setSpeed(4)
.setDamage(30)
.setMul(new Price().setCost("Power", 2));