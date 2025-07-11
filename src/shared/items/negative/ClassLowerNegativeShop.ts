import { AREAS } from "shared/constants";
import Difficulties from "shared/difficulty/Difficulties";
import Shop from "shared/item/Shop";
import AdvancedRefiner from "./a/AdvancedRefiner";
import DropDropper from "./a/DropDropper";
import DualDropper from "./a/DualDropper";
import HandCrankGenerator from "./a/HandCrankGenerator";
import InstantiationDelimiterII from "./a/InstantiationDelimiterII";
import ColorStrictFurnace from "./exist/ColorStrictFurnace";
import DropletSlayerMkII from "./exist/DropletSlayerMkII";
import EffervescentDropletSpray from "./exist/EffervescentDropletSpray";
import PurifiersRefiner from "./exist/PurifiersRefiner";
import RapidDropper from "./exist/RapidDropper";
import ShockingRefiner from "./exist/ShockingRefiner";
import AdvancedCharger from "./felixthea/AdvancedCharger";
import AwesomeManumaticPurifier from "./felixthea/AwesomeManumaticPurifier";
import BasicCondenser from "./felixthea/BasicCondenser";
import ElevatedConveyor from "./felixthea/ElevatedConveyor";
import ElevatedConveyorCorner from "./felixthea/ElevatedConveyorCorner";
import ElevatedUpgrader from "./felixthea/ElevatedUpgrader";
import ElevatingConveyor from "./felixthea/ElevatingConveyor";
import ShockingCauldron from "./felixthea/ShockingCauldron";
import AnticlockwiseConveyorCorner from "./friendliness/AnticlockwiseConveyorCorner";
import EnergisedFurnace from "./friendliness/EnergisedFurnace";
import EnergisedRefiner from "./friendliness/EnergisedRefiner";
import GrassConveyor from "./friendliness/GrassConveyor";
import GrassDropper from "./friendliness/GrassDropper";
import IndustrialFurnace from "./friendliness/IndustrialFurnace";
import DirectDropletWasher from "./negativity/DirectDropletWasher";
import DropletSlayerMkI from "./negativity/DropletSlayerMkI";
import HandCrankDropper from "./negativity/HandCrankDropper";
import HeavyweightDropper from "./negativity/HeavyweightDropper";
import InstantiationDelimiterI from "./negativity/InstantiationDelimiterI";
import TheFirstConveyor from "./tfd/TheFirstConveyor";
import TheFirstDropper from "./tfd/TheFirstDropper";
import TheFirstFurnace from "./tfd/TheFirstFurnace";
import TheFirstGenerator from "./tfd/TheFirstGenerator";
import TheFirstUpgrader from "./tfd/TheFirstUpgrader";
import BasicCauldron from "./tlg/BasicCauldron";
import BasicRefiner from "./tlg/BasicRefiner";
import BulkyDropper from "./tlg/BulkyDropper";
import ConveyorCorner from "./tlg/ConveyorCorner";
import ExtendedConveyor from "./tlg/ExtendedConveyor";
import ImprovedFurnace from "./tlg/ImprovedFurnace";
import BasicCharger from "./trueease/BasicCharger";
import BasicPowerHarvester from "./trueease/BasicPowerHarvester";
import DropletElectronInfuser from "./trueease/DropletElectronInfuser";
import QuickConveyor from "./trueease/QuickConveyor";
import UpgradeBoardI from "./trueease/UpgradeBoardI";
import UpgradedGenerator from "./trueease/UpgradedGenerator";
import VibrantDropper from "./trueease/VibrantDropper";
import ButtonFurnace from "./unimpossible/ButtonFurnace";
import LaserFan from "./unimpossible/LaserFan";
import SmallReactor from "./unimpossible/SmallReactor";
import VolatileCauldron from "./unimpossible/VolatileCauldron";
import CompactReactor from "./reversedperipherality/CompactReactor";
import ConversionConveyor from "./reversedperipherality/ConversionConveyor";
import VeryNiceTower from "../bonuses/VeryNiceTower";
import OverusedAmethystDropper from "./reversedperipherality/OverusedAmethystDropper";
import PeripheralGenerator from "./reversedperipherality/PeripheralGenerator";
import MagmaticConveyor from "./reversedperipherality/MagmaticConveyor";

export = new Shop("ClassLowerNegativeShop")
.setName("Class Negative Shop")
.setDescription("Purchase all of your items here! Well, at least all items below Instant Win difficulty.")
.setDifficulty(Difficulties.TheFirstDifficulty)
.addPlaceableArea(AREAS.BarrenIslands)
.setItems([
    TheFirstDropper,
    TheFirstFurnace,
    TheFirstConveyor,
    TheFirstUpgrader,

    BulkyDropper,
    ImprovedFurnace,
    ExtendedConveyor,
    BasicRefiner,
    BasicCauldron,
    ConveyorCorner,

    HandCrankDropper,
    DropletSlayerMkI,
    HeavyweightDropper,
    DirectDropletWasher,
    InstantiationDelimiterI,

    LaserFan,
    VolatileCauldron,
    ButtonFurnace,
    SmallReactor,

    GrassConveyor,
    AnticlockwiseConveyorCorner,
    GrassDropper,
    IndustrialFurnace,

    TheFirstGenerator,

    EnergisedRefiner,
    EnergisedFurnace,

    BasicCharger,
    UpgradeBoardI,
    VibrantDropper,
    DropletElectronInfuser,
    UpgradedGenerator,
    QuickConveyor,
    BasicPowerHarvester,
    
    DualDropper,
    InstantiationDelimiterII,
    DropDropper,
    AdvancedRefiner,
    HandCrankGenerator,
    
    ShockingCauldron,
    ElevatedUpgrader,
    ElevatingConveyor,
    AdvancedCharger,
    AwesomeManumaticPurifier,
    BasicCondenser,
    ElevatedConveyor,
    ElevatedConveyorCorner,
    
    EffervescentDropletSpray,
    RapidDropper,
    ColorStrictFurnace,
    PurifiersRefiner,
    DropletSlayerMkII,
    ShockingRefiner,

    CompactReactor,
    ConversionConveyor,
    OverusedAmethystDropper,
    PeripheralGenerator,
    MagmaticConveyor,

    VeryNiceTower
]);