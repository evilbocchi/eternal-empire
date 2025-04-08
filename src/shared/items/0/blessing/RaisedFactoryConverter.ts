import Difficulty from "@antivivi/jjt-difficulties";
import Conveyor from "shared/item/traits/Conveyor";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Raised Funnel")
    .setDescription("Funnels droplets into the center of a 3x3 grid area. Maybe you could find a use for this somehow?")
    .setDifficulty(Difficulty.Blessing)
    .setPrice(new CurrencyBundle().set("Skill", 1), 1, 5)
    .setPrice(new CurrencyBundle().set("Skill", 2), 6, 10)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .persists("Skillification")

    .trait(Conveyor)
    .setSpeed(4)

    .exit();