import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Shop from "shared/item/traits/Shop";
import SphericalDropper from "shared/items/0/automatic/SphericalDropper";
import SphericalUpgrader from "shared/items/0/automatic/SphericalUpgrader";
import SortingConveyor from "shared/items/0/donothing/SortingConveyor";
import LeashedConveyor from "shared/items/0/locomotion/LeashedConveyor";
import UnleashedElevatedMiniConveyor from "shared/items/0/locomotion/UnleashedElevatedMiniConveyor";
import SolarPoweredDropper from "shared/items/0/walkthrough/SolarPoweredDropper";
import OverheadUpgrader from "shared/items/0/win/OverheadUpgrader";
import WinsomeBucket from "shared/items/0/winsome/WinsomeBucket";
import WinsomeCharm from "shared/items/0/winsome/WinsomeCharm";
import FoolsTribute from "shared/items/excavation/harvestable/FoolsTribute";
import CrimsonCemetery from "shared/items/miscellaneous/CrimsonCemetery";
import CrystalDrill from "shared/items/miscellaneous/CrystalDrill";
import ElevatedCoinKiller from "shared/items/miscellaneous/ElevatedCoinKiller";
import FrostSnow from "shared/items/miscellaneous/FrostSnow";
import GildedStaircase from "shared/items/miscellaneous/GildedStaircase";
import GoldDiggersHaven from "shared/items/miscellaneous/GoldDiggersHaven";
import HeavyFoundry from "shared/items/miscellaneous/HeavyFoundry";
import LostHeaven from "shared/items/miscellaneous/LostHeaven";

export = new Item(script.Name)
    .setName("Magical Crafting Table")
    .setDifficulty(Difficulty.Bonuses)
    .setDescription("A variant of the Crafting Table with more latent power, allowing you to craft more powerful items.")
    .setPrice(new CurrencyBundle().set("Funds", 1e60), 1)

    .trait(Shop)
    .setItems([
        HeavyFoundry,
        GoldDiggersHaven,
        FrostSnow,
        LostHeaven,
        ElevatedCoinKiller,
        GildedStaircase,

        OverheadUpgrader,
        WinsomeBucket,
        WinsomeCharm,
        SortingConveyor,
        UnleashedElevatedMiniConveyor,
        LeashedConveyor,
        FoolsTribute,
        CrystalDrill,
        CrimsonCemetery,
        SolarPoweredDropper,
        SphericalDropper,
        SphericalUpgrader
    ])

    .exit();