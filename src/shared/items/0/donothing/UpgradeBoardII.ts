import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import NamedUpgrade from "shared/item/NamedUpgrade";
import UpgradeBoard from "shared/item/UpgradeBoard";

export = new UpgradeBoard("UpgradeBoardII")
.setName("Upgrade Board II")
.setDescription("You need more money. Use this upgrade board to help you...")
.setDifficulty(Difficulty.DoNothing)
.setPrice(new Price().setCost("Bitcoin", 30), 1)
.addPlaceableArea("SlamoVillage")

.addUpgrade(NamedUpgrade.CryptographicFunds)
.addUpgrade(NamedUpgrade.CryptographicPower)
.addUpgrade(NamedUpgrade.SkilledMining)
.addUpgrade(NamedUpgrade.LandReclaimationII)