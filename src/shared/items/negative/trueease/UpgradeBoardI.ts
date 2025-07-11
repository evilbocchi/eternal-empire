import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulties from "shared/difficulty/Difficulties";
import NamedUpgrade from "shared/item/NamedUpgrade";
import UpgradeBoard from "shared/item/UpgradeBoard";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

export = new UpgradeBoard("UpgradeBoardI")
.setName("Upgrade Board I")
.setDescription("A board that contains various upgrades which may help you grow more money...")
.setDifficulty(Difficulties.TrueEase)
.setPrice(new Price().setCost("Funds", new InfiniteMath([15.5, 9])).setCost("Power", 150), 1)
.addPlaceableArea(AREAS.BarrenIslands)

.addUpgrade(NamedUpgrade.MoreFunds)
.addUpgrade(NamedUpgrade.MorePower)
.addUpgrade(NamedUpgrade.FasterTreading)
.addUpgrade(NamedUpgrade.LandReclaimation);