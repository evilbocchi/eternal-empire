import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import UpgradeBoard from "shared/item/traits/UpgradeBoard";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";
import Class0Shop from "shared/items/0/Class0Shop";

export = new Item(script.Name)
    .setName("Upgrade Board II")
    .setDescription("You need more money. Use this upgrade board to help you.")
    .setDifficulty(Difficulty.DoNothing)
    .setPrice(new CurrencyBundle().set("Bitcoin", 30), 1)
    .addPlaceableArea("SlamoVillage")
    .soldAt(Class0Shop)

    .trait(UpgradeBoard)
    .addUpgrade(NamedUpgrades.CryptographicFunds)
    .addUpgrade(NamedUpgrades.CryptographicPower)
    .addUpgrade(NamedUpgrades.SkilledMining)
    .addUpgrade(NamedUpgrades.LandReclaimationII)

    .exit();
