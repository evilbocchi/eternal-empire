import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import UpgradeBoard from "shared/item/traits/UpgradeBoard";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";

export = new Item(script.Name)
    .setName("Upgrade Board II")
    .setDescription("You need more money. Use this upgrade board to help you.")
    .setDifficulty(Difficulty.DoNothing)
    .setPrice(new CurrencyBundle().set("Bitcoin", 30), 1)
    .addPlaceableArea("SlamoVillage")

    .trait(UpgradeBoard)
    .addUpgrade(NamedUpgrades.CryptographicFunds)
    .addUpgrade(NamedUpgrades.CryptographicPower)
    .addUpgrade(NamedUpgrades.SkilledMining)
    .addUpgrade(NamedUpgrades.LandReclaimationII)

    .exit();