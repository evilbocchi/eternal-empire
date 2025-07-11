import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import UpgradeBoard from "shared/item/UpgradeBoard";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";

export = new UpgradeBoard(script.Name)
    .setName("Upgrade Board II")
    .setDescription("You need more money. Use this upgrade board to help you...")
    .setDifficulty(Difficulty.DoNothing)
    .setPrice(new Price().setCost("Bitcoin", 30), 1)
    .addPlaceableArea("SlamoVillage")

    .addUpgrade(NamedUpgrades.CryptographicFunds)
    .addUpgrade(NamedUpgrades.CryptographicPower)
    .addUpgrade(NamedUpgrades.SkilledMining)
    .addUpgrade(NamedUpgrades.LandReclaimationII);