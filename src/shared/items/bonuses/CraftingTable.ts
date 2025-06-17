import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Shop from "shared/item/traits/Shop";
import EnchantedGrass from "shared/items/excavation/harvestable/EnchantedGrass";
import HopefulRose from "shared/items/excavation/harvestable/HopefulRose";
import MagicalWood from "shared/items/excavation/harvestable/MagicalWood";
import DropletDiverger from "shared/items/miscellaneous/DropletDiverger";
import ElectroshockedCoil from "shared/items/miscellaneous/ElectroshockedCoil";
import EmpoweredBrick from "shared/items/miscellaneous/EmpoweredBrick";
import IndustrialOverpass from "shared/items/miscellaneous/IndustrialOverpass";
import Lamp from "shared/items/miscellaneous/Lamp";
import LegPoweredDropper from "shared/items/miscellaneous/LegPoweredDropper";
import LimitBreaker from "shared/items/miscellaneous/LimitBreaker";
import OverengineeredGenerator from "shared/items/miscellaneous/OverengineeredGenerator";
import Sideswiper from "shared/items/miscellaneous/Sideswiper";
import TeslaCharger from "shared/items/miscellaneous/TeslaCharger";
import PolarizedRefiner from "shared/items/negative/a/PolarizedRefiner";
import FictionalUpgrader from "shared/items/negative/exist/FictionalUpgrader";

export = new Item(script.Name)
    .setName("Crafting Table")
    .setDifficulty(Difficulty.Bonuses)
    .setDescription("A table that allows you to craft items.")
    .setPrice(new CurrencyBundle().set("Funds", 1e42), 1)
    .placeableEverywhere()

    .trait(Shop)
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
        MagicalWood,
        HopefulRose,
        EmpoweredBrick
    ])

    .exit();