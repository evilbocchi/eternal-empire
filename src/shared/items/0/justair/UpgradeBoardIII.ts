import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import UpgradeBoard from "shared/item/UpgradeBoard";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";

export = new UpgradeBoard(script.Name)
    .setName("Upgrade Board III")
    .setDescription("This upgrade board will last you an eternity. Use it to obtain small, but necessary boosts for exorbitant prices.")
    .setDifficulty(Difficulty.JustAir)
    .setPrice(new Price().setCost("Funds", 2.1e30).setCost("Bitcoin", 100000).setCost("Skill", 10), 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")

    .addUpgrade(NamedUpgrades.ArtOfPurification)
    .addUpgrade(NamedUpgrades.DarkerMatter)
    .addUpgrade(NamedUpgrades.SubsonicTreads)
    .addUpgrade(NamedUpgrades.EfficientLearning);