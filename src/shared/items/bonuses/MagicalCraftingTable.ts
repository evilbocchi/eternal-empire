import Difficulty from "@antivivi/jjt-difficulties";
import Shop from "shared/item/Shop";
import SortingConveyor from "shared/items/0/donothing/SortingConveyor";
import SolarPoweredDropper from "shared/items/0/walkthrough/SolarPoweredDropper";
import OverheadUpgrader from "shared/items/0/win/OverheadUpgrader";
import WinsomeBucket from "shared/items/0/winsome/WinsomeBucket";
import WinsomeCharm from "shared/items/0/winsome/WinsomeCharm";
import FoolsTribute from "shared/items/excavation/harvestable/FoolsTribute";
import CrimsonCemetery from "shared/items/miscellaneous/CrimsonCemetery";
import CrystalDrill from "shared/items/miscellaneous/CrystalDrill";
import FrostSnow from "shared/items/miscellaneous/FrostSnow";
import GoldDiggersHaven from "shared/items/miscellaneous/GoldDiggersHaven";
import HeavyFoundry from "shared/items/miscellaneous/HeavyFoundry";
import LostHeaven from "shared/items/miscellaneous/LostHeaven";

export = new Shop(script.Name)
.setName("Magical Crafting Table")
.setDifficulty(Difficulty.Bonuses)
.setItems([
    HeavyFoundry,
    GoldDiggersHaven,
    FrostSnow,
    LostHeaven,
    OverheadUpgrader,
    WinsomeBucket,
    WinsomeCharm,
    SortingConveyor,
    FoolsTribute,
    CrystalDrill,
    CrimsonCemetery,
    SolarPoweredDropper,
]);