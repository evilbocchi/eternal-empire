import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Shop from "shared/item/Shop";
import SpatialDropper from "shared/items/0/astronomical/SpatialDropper";
import SpatialFurnace from "shared/items/0/astronomical/SpatialFurnace";
import BasicSkillFactory from "shared/items/0/blessing/BasicSkillFactory";
import ArbitersKillbricks from "shared/items/0/donothing/ArbitersKillbricks";
import CoinRefiner from "shared/items/0/donothing/CoinRefiner";
import TesseractBooster from "shared/items/0/donothing/TesseractBooster";
import UpgradeBoardII from "shared/items/0/donothing/UpgradeBoardII";
import BasicPrinter from "shared/items/0/millisecondless/BasicPrinter";
import BasicTesseract from "shared/items/0/millisecondless/BasicTesseract";
import HandCrankDropperV2 from "shared/items/0/millisecondless/HandCrankDropperV2";
import NormalReactor from "shared/items/0/millisecondless/NormalReactor";
import SlamoClicker from "shared/items/0/millisecondless/SlamoClicker";
import StrongCondenser from "shared/items/0/millisecondless/StrongCondenser";
import AnotherWorld from "shared/items/0/sleepful/AnotherWorld";
import AdvancedHealthPack from "shared/items/0/win/AdvancedHealthPack";
import EfficientKillingUpgrader from "shared/items/0/win/EfficientKillingUpgrader";
import HydratingDropper from "shared/items/0/win/HydratingDropper";
import ImprovedTesseract from "shared/items/0/win/ImprovedTesseract";
import InclinedRefiner from "shared/items/0/win/InclinedRefiner";
import BasicCoinMiner from "shared/items/0/winsome/BasicCoinMiner";
import PurifyingCauldron from "shared/items/0/winsome/PurifyingCauldron";
import SubHydratingFurnace from "shared/items/0/winsome/SubHydratingFurnace";
import TransientTesseract from "shared/items/0/winsome/TransientTesseract";

export = new Shop("Class0Shop")
.setName("Class 0 Shop")
.setDescription("Buy your favorite Millisecondless to Spontaneous items here! You can get two of this shop.")
.setDifficulty(Difficulty.Millisecondless)
.addPlaceableArea("BarrenIslands", "SlamoVillage")
.setPrice(new Price().setCost("Skill", 0), 1, 2)
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

    SubHydratingFurnace,
    TransientTesseract,
    PurifyingCauldron,
    BasicCoinMiner,

    UpgradeBoardII,
    ArbitersKillbricks,
    CoinRefiner,
    TesseractBooster,

    AnotherWorld,
    BasicSkillFactory
]);