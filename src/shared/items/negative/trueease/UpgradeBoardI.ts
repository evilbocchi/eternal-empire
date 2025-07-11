import Difficulty from "@antivivi/jjt-difficulties";
import UpgradeBoard from "shared/item/UpgradeBoard";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";
import Price from "shared/Price";

export = new UpgradeBoard(script.Name)
    .setName("Upgrade Board I")
    .setDescription("A board that contains various upgrades which may help you grow more money...")
    .setDifficulty(Difficulty.TrueEase)
    .setPrice(new Price().setCost("Funds", 15.5e9).setCost("Power", 150), 1)
    .addPlaceableArea("BarrenIslands")

    .addUpgrade(NamedUpgrades.MoreFunds)
    .addUpgrade(NamedUpgrades.MorePower)
    .addUpgrade(NamedUpgrades.FasterTreading)
    .addUpgrade(NamedUpgrades.LandReclaimation);