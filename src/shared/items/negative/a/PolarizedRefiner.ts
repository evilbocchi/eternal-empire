import Difficulty from "@antivivi/jjt-difficulties";
import { OmniUpgrader } from "shared/item/Special";
import Crystal from "shared/items/excavation/Crystal";
import ExcavationStone from "shared/items/excavation/ExcavationStone";
import Iron from "shared/items/excavation/Iron";
import WhiteGem from "shared/items/excavation/WhiteGem";
import Price from "shared/Price";

export = new OmniUpgrader(script.Name)
.setName("Polarized Refiner")
.setDescription("The result of combining two upgraders together, with a harmful side effect. The green laser gives a x2 Funds boost while the yellow laser gives a x2 Power boost. The middle laser, however, negates all boosts and makes the droplet worthless.")
.setDifficulty(Difficulty.A)
.setPrice(new Price().setCost("Funds", 2e12), 1)
.setRequiredItemAmount(ExcavationStone, 40)
.setRequiredItemAmount(WhiteGem, 20)
.setRequiredItemAmount(Crystal, 15)
.setRequiredItemAmount(Iron, 2)
.addPlaceableArea("BarrenIslands")
.setCreator("simple13579")
.persists()

.setSpeed(5)
.setMuls(new Map([
    ["FundsLaser", new Price().setCost("Funds", 2)],
    ["PowerLaser", new Price().setCost("Power", 2)],
    ["NoneLaser", new Price().setCost("Funds", 0).setCost("Power", 0)],
]));