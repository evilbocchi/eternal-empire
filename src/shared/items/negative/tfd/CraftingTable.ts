import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Shop from "shared/item/traits/Shop";
import EnchantedGrass from "shared/items/excavation/harvestable/EnchantedGrass";
import HopefulRose from "shared/items/excavation/harvestable/HopefulRose";
import MagicalWood from "shared/items/excavation/harvestable/MagicalWood";
import ElectroshockedCoil from "shared/items/negative/a/ElectroshockedCoil";
import EnergyPoweredDropper from "shared/items/negative/a/EnergyPoweredDropper";
import PolarizedRefiner from "shared/items/negative/a/PolarizedRefiner";
import FictionalUpgrader from "shared/items/negative/exist/FictionalUpgrader";
import IndustrialOverpass from "shared/items/negative/exist/IndustrialOverpass";
import LegPoweredDropper from "shared/items/negative/felixthea/LegPoweredDropper";
import LimitBreaker from "shared/items/negative/friendliness/LimitBreaker";
import EmpoweredBrick from "shared/items/negative/instantwin/EmpoweredBrick";
import Lamp from "shared/items/negative/negativity/Lamp";
import TeslaCharger from "shared/items/negative/relax/TeslaCharger";
import DropletDiverger from "shared/items/negative/skip/DropletDiverger";
import OverengineeredGenerator from "shared/items/negative/trueease/OverengineeredGenerator";

export = new Item(script.Name)
    .setName("Crafting Table")
    .setDifficulty(Difficulty.TheFirstDifficulty)
    .setDescription("A table that allows you to craft items.")
    .setPrice(new CurrencyBundle().set("Funds", 1e42), 1)
    .placeableEverywhere()
    .persists()

    .trait(Shop)
    .setItems([
        Lamp,

        LimitBreaker,

        OverengineeredGenerator,

        EnergyPoweredDropper,
        PolarizedRefiner,
        ElectroshockedCoil,

        LegPoweredDropper,

        FictionalUpgrader,
        IndustrialOverpass,

        TeslaCharger,

        DropletDiverger,

        EmpoweredBrick,

        EnchantedGrass,
        MagicalWood,
        HopefulRose,
    ])

    .exit();