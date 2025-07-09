import Difficulty from "@antivivi/jjt-difficulties";
import Accelerator from "shared/item/traits/conveyor/Accelerator";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Charger from "shared/item/traits/generator/Charger";

export = new Item(script.Name)
    .setName("Conveyor Overclocker")
    .setDescription("Speeds up unleashed conveyors within %radius% of this machinery.")
    .setDifficulty(Difficulty.Locomotion)
    .setPrice(new CurrencyBundle().set("Power", 1e18), 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .persists()

    .trait(Charger)
    .setRadius(25)

    .trait(Accelerator)
    .setBoost(3)

    .exit();