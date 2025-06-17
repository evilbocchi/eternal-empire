import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Shop from "shared/item/traits/Shop";
import DropletCoaster from "shared/items/1/coasterifying/DropletCoaster";
import SilentMemory from "shared/items/1/dosomething/SilentMemory";
import AbruptBridge from "shared/items/1/joyful/AbruptBridge";
import AntiGravityConverter from "shared/items/1/joyful/AntiGravityConverter";
import ChildhoodSlide from "shared/items/1/joyful/ChildhoodSlide";
import JoyfulPark from "shared/items/1/joyful/JoyfulPark";
import Baseplate from "shared/items/1/placid/Baseplate";
import FullConversionRamp from "shared/items/1/walkaslope/FullConversionRamp";

export = new Item(script.Name)
    .setName("Class 1 Shop")
    .setDescription("Buy your favorite Joyful to Effortlessless items here! You can get three of this shop.")
    .setDifficulty(Difficulty.Joyful)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .setPrice(new CurrencyBundle().set("Skill", 0), 1, 2)
    .persists()

    .trait(Shop)
    .setItems([
        JoyfulPark,
        ChildhoodSlide,
        AbruptBridge,
        AntiGravityConverter,

        SilentMemory,

        Baseplate,

        FullConversionRamp,

        DropletCoaster
    ])

    .exit();