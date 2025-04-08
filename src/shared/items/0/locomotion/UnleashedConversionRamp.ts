import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/Conveyor";
import UnleashedConveyor from "shared/item/traits/special/UnleashedConveyor";

export = new Item(script.Name)
    .setName("Unleashed Conversion Ramp")
    .setDescription("Bringing your droplets above ground has never been faster. May be slightly steeper, though.")
    .setDifficulty(Difficulty.Locomotion)
    .setPrice(new CurrencyBundle().set("Bitcoin", 10000), 1, 30)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .persists("Skillification")

    .trait(Conveyor)
    .setSpeed(9)

    .trait(UnleashedConveyor)
    .exit();