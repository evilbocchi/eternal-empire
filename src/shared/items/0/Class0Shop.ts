import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Shop from "shared/item/traits/Shop";
import SpatialDropper from "shared/items/0/astronomical/SpatialDropper";
import SpatialFurnace from "shared/items/0/astronomical/SpatialFurnace";
import AutomaticArbition from "shared/items/0/automatic/AutomaticArbition";
import IllusionaryPortal from "shared/items/0/automatic/IllusionaryPortal";
import MoneyBin from "shared/items/0/automatic/MoneyBin";
import SkillBooster from "shared/items/0/automatic/SkillBooster";
import TwoStoreyUpgrader from "shared/items/0/automatic/TwoStoreyUpgrader";
import AutomaticJoyfulFurnace from "shared/items/0/automaticjoyful/AutomaticJoyfulFurnace";
import AutomaticRadiowaveConnector from "shared/items/0/automaticjoyful/AutomaticRadiowaveConnector";
import DiamondIntersectionUpgrader from "shared/items/0/automaticjoyful/DiamondIntersectionUpgrader";
import GlisteningFurnace from "shared/items/0/automaticjoyful/GlisteningFurnace";
import OctupleCoinMiner from "shared/items/0/automaticjoyful/OctupleCoinMiner";
import BasicSkillFactory from "shared/items/0/blessing/BasicSkillFactory";
import BlessedConveyor from "shared/items/0/blessing/BlessedConveyor";
import DoubleCoinMiner from "shared/items/0/blessing/DoubleCoinMiner";
import HeartfulSpray from "shared/items/0/blessing/HeartfulSpray";
import RaisedFactoryConverter from "shared/items/0/blessing/RaisedFactoryConverter";
import SkillEaser from "shared/items/0/blessing/SkillEaser";
import TheAmplifier from "shared/items/0/blessing/TheAmplifier";
import ArbitersKillbricks from "shared/items/0/donothing/ArbitersKillbricks";
import CoinRefiner from "shared/items/0/donothing/CoinRefiner";
import TesseractBooster from "shared/items/0/donothing/TesseractBooster";
import UpgradeBoardII from "shared/items/0/donothing/UpgradeBoardII";
import AbnormalReactor from "shared/items/0/frivolous/AbnormalReactor";
import DropletTurbine from "shared/items/0/frivolous/DropletTurbine";
import FlamethrowerUpgrader from "shared/items/0/frivolous/FlamethrowerUpgrader";
import RadioNoob from "shared/items/0/frivolous/RadioNoob";
import RingOfDespair from "shared/items/0/frivolous/RingOfDespair";
import Timewall from "shared/items/0/frivolous/Timewall";
import EndlessVoid from "shared/items/0/happylike/EndlessVoid";
import HappyDropper from "shared/items/0/happylike/HappyDropper";
import HappyTesseract from "shared/items/0/happylike/HappyTesseract";
import InjuringUpgrader from "shared/items/0/happylike/InjuringUpgrader";
import SlamoUpgrader from "shared/items/0/happylike/SlamoUpgrader";
import VoidSkyUpgrader from "shared/items/0/happylike/VoidSkyUpgrader";
import AdvancedBlankEssence from "shared/items/0/ifinitude/AdvancedBlankEssence";
import ChromaticMaze from "shared/items/0/ifinitude/ChromaticMaze";
import CoalescentRefiner from "shared/items/0/ifinitude/CoalescentRefiner";
import CorruptedBonanza from "shared/items/0/ifinitude/CorruptedBonanza";
import DiversityFurnace from "shared/items/0/ifinitude/DiversityFurnace";
import VibrantVortex from "shared/items/0/ifinitude/VibrantVortex";
import HydrogenBombPrototypeSlamo from "shared/items/0/justair/HydrogenBombPrototypeSlamo";
import QuadrupleCoinMiner from "shared/items/0/justair/QuadrupleCoinMiner";
import SkillNormalizer from "shared/items/0/justair/SkillNormalizer";
import StrongCharger from "shared/items/0/justair/StrongCharger";
import UpgradeBoardIII from "shared/items/0/justair/UpgradeBoardIII";
import UnleashedAnticlockwiseConveyorCorner from "shared/items/0/locomotion/UnleashedAnticlockwiseConveyorCorner";
import UnleashedConversionRamp from "shared/items/0/locomotion/UnleashedConversionRamp";
import UnleashedConveyor from "shared/items/0/locomotion/UnleashedConveyor";
import UnleashedConveyorCorner from "shared/items/0/locomotion/UnleashedConveyorCorner";
import UnleashedElevatedAnticlockwiseConveyorCorner from "shared/items/0/locomotion/UnleashedElevatedAnticlockwiseConveyorCorner";
import UnleashedElevatedConveyor from "shared/items/0/locomotion/UnleashedElevatedConveyor";
import UnleashedElevatedConveyorCorner from "shared/items/0/locomotion/UnleashedElevatedConveyorCorner";
import UnleashedMiniConveyor from "shared/items/0/locomotion/UnleashedMiniConveyor";
import UnleashedSkyConverter from "shared/items/0/locomotion/UnleashedSkyConverter";
import UnleashedSkyConveyor from "shared/items/0/locomotion/UnleashedSkyConveyor";
import BasicPrinter from "shared/items/0/millisecondless/BasicPrinter";
import BasicTesseract from "shared/items/0/millisecondless/BasicTesseract";
import HandCrankDropperV2 from "shared/items/0/millisecondless/HandCrankDropperV2";
import NormalReactor from "shared/items/0/millisecondless/NormalReactor";
import SlamoClicker from "shared/items/0/millisecondless/SlamoClicker";
import StrongCondenser from "shared/items/0/millisecondless/StrongCondenser";
import DropletShatterer from "shared/items/0/shatteredbabass/DropletShatterer";
import ShatteredBabass from "shared/items/0/shatteredbabass/ShatteredBabass";
import AnotherWorld from "shared/items/0/sleepful/AnotherWorld";
import HeavenGarden from "shared/items/0/sleepful/HeavenGarden";
import Ame from "shared/items/0/spontaneous/Ame";
import CruelBlankEssence from "shared/items/0/spontaneous/CruelBlankEssence";
import EmeraldProcessor from "shared/items/0/spontaneous/EmeraldProcessor";
import FocalPoint from "shared/items/0/spontaneous/FocalPoint";
import LightOfAttrition from "shared/items/0/spontaneous/LightOfAttrition";
import OctahedralTemple from "shared/items/0/spontaneous/OctahedralTemple";
import Solitude from "shared/items/0/spontaneous/Solitude";
import SpontaneousRefiner from "shared/items/0/spontaneous/SpontaneousRefiner";
import XLayerAgglomerate from "shared/items/0/spontaneous/XLayerAgglomerate";
import InstantiationDelimiterV from "shared/items/0/unlosable/InstantiationDelimiterV";
import ReinforcedCondenser from "shared/items/0/unlosable/ReinforcedCondenser";
import ReinforcedTesseract from "shared/items/0/unlosable/ReinforcedTesseract";
import RingOfFortune from "shared/items/0/unlosable/RingOfFortune";
import SexdecupleCoinMiner from "shared/items/0/unlosable/SexdecupleCoinMiner";
import StrongSkillFactory from "shared/items/0/unlosable/StrongSkillFactory";
import TimelostDesert from "shared/items/0/vibeness/TimelostDesert";
import VibePillar from "shared/items/0/vibeness/VibePillar";
import AdvancedTesseract from "shared/items/0/vintage/AdvancedTesseract";
import CanisteringGenerator from "shared/items/0/vintage/CanisteringGenerator";
import ClassicDropper from "shared/items/0/vintage/ClassicDropper";
import DropletScanner from "shared/items/0/vintage/DropletScanner";
import LunaryDropper from "shared/items/0/vintage/LunaryDropper";
import Memories from "shared/items/0/vintage/Memories";
import SmilingKiller from "shared/items/0/vintage/SmilingKiller";
import AdvancedSkillFactory from "shared/items/0/walkthrough/AdvancedSkillFactory";
import FundsAccelerator from "shared/items/0/walkthrough/FundsAccelerator";
import InstantiationDelimiterIV from "shared/items/0/walkthrough/InstantiationDelimiterIV";
import LaserTurbine from "shared/items/0/walkthrough/LaserTurbine";
import RoboticCauldron from "shared/items/0/walkthrough/RoboticCauldron";
import AdvancedHealthPack from "shared/items/0/win/AdvancedHealthPack";
import ColorStrictConveyor from "shared/items/0/win/ColorStrictConveyor";
import EfficientKillingUpgrader from "shared/items/0/win/EfficientKillingUpgrader";
import HydratingDropper from "shared/items/0/win/HydratingDropper";
import ImprovedTesseract from "shared/items/0/win/ImprovedTesseract";
import InclinedRefiner from "shared/items/0/win/InclinedRefiner";
import BasicCoinMiner from "shared/items/0/winsome/BasicCoinMiner";
import PurifyingCauldron from "shared/items/0/winsome/PurifyingCauldron";
import SubHydratingFurnace from "shared/items/0/winsome/SubHydratingFurnace";
import TransientTesseract from "shared/items/0/winsome/TransientTesseract";

export = new Item(script.Name)
    .setName("Class 0 Shop")
    .setDescription("Buy your favorite Millisecondless to Spontaneous items here! You can get two of this shop.")
    .setDifficulty(Difficulty.Millisecondless)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .setPrice(new CurrencyBundle().set("Skill", 0), 1, 2)
    .persists()

    .trait(Shop)
    .setItems([
        BasicPrinter,
        BasicTesseract,
        HandCrankDropperV2,
        NormalReactor,
        StrongCondenser,
        SlamoClicker,

        SpatialDropper,
        SpatialFurnace,

        ImprovedTesseract,
        InclinedRefiner,
        EfficientKillingUpgrader,
        AdvancedHealthPack,
        HydratingDropper,
        ColorStrictConveyor,

        SubHydratingFurnace,
        TransientTesseract,
        PurifyingCauldron,
        BasicCoinMiner,

        UpgradeBoardII,
        ArbitersKillbricks,
        CoinRefiner,
        TesseractBooster,

        AnotherWorld,
        HeavenGarden,

        BasicSkillFactory,
        BlessedConveyor,
        HeartfulSpray,
        DoubleCoinMiner,
        RaisedFactoryConverter,
        SkillEaser,
        TheAmplifier,

        LunaryDropper,
        ClassicDropper,
        SmilingKiller,
        CanisteringGenerator,
        Memories,
        AdvancedTesseract,
        DropletScanner,

        AdvancedBlankEssence,
        CorruptedBonanza,
        CoalescentRefiner,
        DiversityFurnace,
        VibrantVortex,
        ChromaticMaze,

        SkillNormalizer,
        UpgradeBoardIII,
        QuadrupleCoinMiner,
        StrongCharger,
        HydrogenBombPrototypeSlamo,

        VoidSkyUpgrader,
        SlamoUpgrader,
        EndlessVoid,
        HappyDropper,
        InjuringUpgrader,
        HappyTesseract,

        UnleashedConveyor,
        UnleashedConveyorCorner,
        UnleashedAnticlockwiseConveyorCorner,
        UnleashedMiniConveyor,
        UnleashedConversionRamp,
        UnleashedElevatedConveyor,
        UnleashedElevatedConveyorCorner,
        UnleashedElevatedAnticlockwiseConveyorCorner,
        UnleashedSkyConverter,
        UnleashedSkyConveyor,

        AdvancedSkillFactory,
        LaserTurbine,
        FundsAccelerator,
        RoboticCauldron,
        InstantiationDelimiterIV,

        DiamondIntersectionUpgrader,
        OctupleCoinMiner,
        GlisteningFurnace,
        AutomaticRadiowaveConnector,
        AutomaticJoyfulFurnace,

        RingOfFortune,
        ReinforcedCondenser,
        SexdecupleCoinMiner,
        ReinforcedTesseract,
        InstantiationDelimiterV,
        StrongSkillFactory,

        ShatteredBabass,
        DropletShatterer,

        Timewall,
        DropletTurbine,
        RadioNoob,
        RingOfDespair,
        FlamethrowerUpgrader,
        AbnormalReactor,

        TimelostDesert,
        VibePillar,

        IllusionaryPortal,
        SkillBooster,
        AutomaticArbition,
        MoneyBin,
        TwoStoreyUpgrader,

        EmeraldProcessor,
        XLayerAgglomerate,
        SpontaneousRefiner,
        LightOfAttrition,
        FocalPoint,
        OctahedralTemple,
        CruelBlankEssence,
        Solitude,
        Ame
    ])

    .exit();