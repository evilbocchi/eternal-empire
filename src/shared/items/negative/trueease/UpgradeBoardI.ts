import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import UpgradeBoard from "shared/item/traits/UpgradeBoard";
import ClassLowerNegativeShop from "shared/items/negative/ClassLowerNegativeShop";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";

export = new Item(script.Name)
    .setName("Upgrade Board I")
    .setDescription("A board that contains various upgrades which may help you grow more money...")
    .setDifficulty(Difficulty.TrueEase)
    .setPrice(new CurrencyBundle().set("Funds", 15.5e9).set("Power", 150), 1)
    .addPlaceableArea("BarrenIslands")
    .soldAt(ClassLowerNegativeShop)

    .trait(UpgradeBoard)
    .addUpgrade(NamedUpgrades.MoreFunds)
    .addUpgrade(NamedUpgrades.MorePower)
    .addUpgrade(NamedUpgrades.FasterTreading)
    .addUpgrade(NamedUpgrades.LandReclaimation)

    .exit();
