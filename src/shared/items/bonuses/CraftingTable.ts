import Difficulty from "@antivivi/jjt-difficulties";
import Shop from "shared/item/Shop";
import EnchantedGrass from "shared/items/excavation/harvestable/EnchantedGrass";
import MagicalWood from "shared/items/excavation/harvestable/MagicalWood";
import DropletDiverger from "shared/items/miscellaneous/DropletDiverger";
import ElectroshockedCoil from "shared/items/miscellaneous/ElectroshockedCoil";
import IndustrialOverpass from "shared/items/miscellaneous/IndustrialOverpass";
import Lamp from "shared/items/miscellaneous/Lamp";
import LegPoweredDropper from "shared/items/miscellaneous/LegPoweredDropper";
import LimitBreaker from "shared/items/miscellaneous/LimitBreaker";
import OverengineeredGenerator from "shared/items/miscellaneous/OverengineeredGenerator";
import Sideswiper from "shared/items/miscellaneous/Sideswiper";
import TeslaCharger from "shared/items/miscellaneous/TeslaCharger";
import PolarizedRefiner from "shared/items/negative/a/PolarizedRefiner";
import FictionalUpgrader from "shared/items/negative/exist/FictionalUpgrader";

export = new Shop(script.Name)
.setName("Crafting Table")
.setDifficulty(Difficulty.Bonuses)
.setItems([
    Lamp,
    OverengineeredGenerator,
    LegPoweredDropper,
    IndustrialOverpass,
    LimitBreaker,
    ElectroshockedCoil,
    DropletDiverger,
    Sideswiper,
    TeslaCharger,
    
    PolarizedRefiner,
    FictionalUpgrader,

    EnchantedGrass,
    MagicalWood
]);