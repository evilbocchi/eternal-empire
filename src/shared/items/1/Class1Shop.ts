import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Shop from "shared/item/traits/Shop";
import DropletCoaster from "shared/items/1/coasterifying/DropletCoaster";
import AntiGravityDropper from "shared/items/1/dosomething/AntiGravityDropper";
import AquaticFurnace from "shared/items/1/dosomething/AquaticFurnace";
import CompressedObbyUpgrader from "shared/items/1/dosomething/CompressedObbyUpgrader";
import ExclamationRefiner from "shared/items/1/dosomething/ExclamationRefiner";
import IndustrialDropletSpray from "shared/items/1/dosomething/IndustrialDropletSpray";
import MovementDetectionDropper from "shared/items/1/dosomething/MovementDetectionDropper";
import SilentMemory from "shared/items/1/dosomething/SilentMemory";
import FragmentalUpgrader from "shared/items/1/effortlessless/FragmentalUpgrader";
import AbruptBridge from "shared/items/1/joyful/AbruptBridge";
import AntiGravityConverter from "shared/items/1/joyful/AntiGravityConverter";
import AntiGravityConveyor from "shared/items/1/joyful/AntiGravityConveyor";
import AntiGravityUpgrader from "shared/items/1/joyful/AntiGravityUpgrader";
import ChildhoodSlide from "shared/items/1/joyful/ChildhoodSlide";
import DropletAscender from "shared/items/1/joyful/DropletAscender";
import GravityGrounder from "shared/items/1/joyful/GravityGrounder";
import JoyfulPark from "shared/items/1/joyful/JoyfulPark";
import TheAmplified from "shared/items/1/joyful/TheAmplified";
import AntiGravityAntiClockwiseConveyor from "shared/items/1/placid/AntiGravityAntiClockwiseConveyor";
import Baseplate from "shared/items/1/placid/Baseplate";
import MinimalInverse from "shared/items/1/placid/MinimalInverse";
import PlacidDropper from "shared/items/1/placid/PlacidDropper";
import AntiGravityFurnace from "shared/items/1/pressakey/AntiGravityFurnace";
import DualGravityUpgrader from "shared/items/1/pressakey/DualGravityUpgrader";
import FullConversionRamp from "shared/items/1/walkaslope/FullConversionRamp";

export = new Item(script.Name)
    .setName("Class 1 Shop")
    .setDescription("Buy your favorite Joyful to Effortlessless items here!")
    .setDifficulty(Difficulty.Joyful)
    .addPlaceableArea("BarrenIslands", "SlamoVillage", "SkyPavilion")
    .setPrice(new CurrencyBundle().set("Wins", 0.1), 1, 5)
    .persists()

    .trait(Shop)
    .setItems([
        AntiGravityConverter,
        AntiGravityConveyor,
        AntiGravityUpgrader,
        GravityGrounder,
        DropletAscender,
        JoyfulPark,
        ChildhoodSlide,
        AbruptBridge,
        TheAmplified,

        MovementDetectionDropper,
        AquaticFurnace,
        SilentMemory,
        CompressedObbyUpgrader,
        IndustrialDropletSpray,
        AntiGravityDropper,
        ExclamationRefiner,

        Baseplate,
        PlacidDropper,
        MinimalInverse,
        AntiGravityAntiClockwiseConveyor,

        AntiGravityFurnace,
        DualGravityUpgrader,

        FullConversionRamp,

        DropletCoaster,

        FragmentalUpgrader,
    ])

    .exit();
