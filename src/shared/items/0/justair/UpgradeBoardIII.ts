import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import UpgradeBoard from "shared/item/traits/UpgradeBoard";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";

export = new Item(script.Name)
    .setName("Upgrade Board III")
    .setDescription("This upgrade board will last you an eternity. Use it to obtain small, but necessary boosts for exorbitant prices.")
    .setDifficulty(Difficulty.JustAir)
    .setPrice(new CurrencyBundle().set("Funds", 2.1e30).set("Bitcoin", 100000).set("Skill", 10), 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")

    .trait(UpgradeBoard)
    .addUpgrade(NamedUpgrades.ArtOfPurification)
    .addUpgrade(NamedUpgrades.DarkerMatter)
    .addUpgrade(NamedUpgrades.SubsonicTreads)
    .addUpgrade(NamedUpgrades.EfficientLearning)

    .exit();