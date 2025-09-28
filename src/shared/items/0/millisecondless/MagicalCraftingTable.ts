import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Shop from "shared/item/traits/Shop";
import AutomatedStairsConveyor from "shared/items/0/automatic/AutomatedStairsConveyor";
import SphericalDropper from "shared/items/0/automatic/SphericalDropper";
import SphericalUpgrader from "shared/items/0/automatic/SphericalUpgrader";
import ElevatedCoinKiller from "shared/items/0/automaticjoyful/ElevatedCoinKiller";
import GildedStaircase from "shared/items/0/automaticjoyful/GildedStaircase";
import HeavyFoundry from "shared/items/0/blessing/HeavyFoundry";
import LostHeaven from "shared/items/0/blessing/LostHeaven";
import SortingConveyor from "shared/items/0/donothing/SortingConveyor";
import FlamingConveyor from "shared/items/0/frivolous/FlamingConveyor";
import CrystalDrill from "shared/items/0/happylike/CrystalDrill";
import FrostSnow from "shared/items/0/justair/FrostSnow";
import LeashedConveyor from "shared/items/0/locomotion/LeashedConveyor";
import UnleashedElevatedMiniConveyor from "shared/items/0/locomotion/UnleashedElevatedMiniConveyor";
import SacredBaptism from "shared/items/0/sleepful/SacredBaptism";
import CrimsonCemetery from "shared/items/0/unlosable/CrimsonCemetery";
import BoomboxElevator from "shared/items/0/vibeness/BoomboxElevator";
import ShrinkflowConveyor from "shared/items/0/vibeness/ShrinkflowConveyor";
import SolarPoweredDropper from "shared/items/0/walkthrough/SolarPoweredDropper";
import OverheadUpgrader from "shared/items/0/win/OverheadUpgrader";
import Sideswiper from "shared/items/0/winsome/Sideswiper";
import WinsomeBucket from "shared/items/0/winsome/WinsomeBucket";
import WinsomeCharm from "shared/items/0/winsome/WinsomeCharm";
import MossUpgrader from "shared/items/1/joyful/MossUpgrader";
import FoolsTribute from "shared/items/excavation/harvestable/FoolsTribute";
import GoldDiggersHaven from "shared/items/negative/skip/GoldDiggersHaven";

export = new Item(script.Name)
    .setName("Magical Crafting Table")
    .setDifficulty(Difficulty.Millisecondless)
    .setDescription(
        "A variant of the Crafting Table with more latent power, allowing you to craft more powerful items.",
    )
    .setPrice(new CurrencyBundle().set("Funds", 1e60), 1)
    .placeableEverywhere()
    .persists()

    .trait(Shop)
    .setItems([
        GoldDiggersHaven,

        OverheadUpgrader,

        Sideswiper,
        WinsomeBucket,
        WinsomeCharm,

        SortingConveyor,

        SacredBaptism,

        HeavyFoundry,
        LostHeaven,

        FrostSnow,

        CrystalDrill,

        UnleashedElevatedMiniConveyor,
        LeashedConveyor,

        SolarPoweredDropper,

        ElevatedCoinKiller,
        GildedStaircase,

        FlamingConveyor,

        CrimsonCemetery,

        BoomboxElevator,
        ShrinkflowConveyor,

        SphericalDropper,
        SphericalUpgrader,
        AutomatedStairsConveyor,

        MossUpgrader,

        FoolsTribute,
    ])

    .exit();
