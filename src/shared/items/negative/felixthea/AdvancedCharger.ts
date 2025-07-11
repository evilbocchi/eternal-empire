import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulties from "shared/difficulty/Difficulties";
import Charger from "shared/item/Charger";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";
import BasicCharger from "../trueease/BasicCharger";

export = new Charger("AdvancedCharger")
.setName("Advanced Charger")
.setDescription("Boosts Power gain of generators within 12 studs radius of this charger by 4x. Be careful though, this uses a hefty $50B/s.")
.setDifficulty(Difficulties.FelixTheA)
.setPrice(new Price().setCost("Funds", new InfiniteMath([108, 12])).setCost("Power", 102000), 1)
.setPrice(new Price().setCost("Funds", new InfiniteMath([226, 12])).setCost("Power", 320200), 2)
.setRequiredItemAmount(BasicCharger, 1)
.addPlaceableArea(AREAS.BarrenIslands)

.setRadius(12)
.setFormula((val) => val.mul(new Price().setCost("Power", 4)))
.setMaintenance(new Price().setCost("Funds", new InfiniteMath([50, 9])));