import Difficulty from "shared/Difficulty";
import NamedUpgrade from "shared/item/NamedUpgrade";
import UpgradeBoard from "shared/item/UpgradeBoard";
import Price from "shared/Price";

export = new UpgradeBoard("UpgradeBoardI")
.setName("Upgrade Board I")
.setDescription("A board that contains various upgrades which may help you grow more money...")
.setDifficulty(Difficulty.TrueEase)
.setPrice(new Price().setCost("Funds", 15.5e9).setCost("Power", 150), 1)
.addPlaceableArea("BarrenIslands")

.addUpgrade(NamedUpgrade.MoreFunds)
.addUpgrade(NamedUpgrade.MorePower)
.addUpgrade(NamedUpgrade.FasterTreading)
.addUpgrade(NamedUpgrade.LandReclaimation);