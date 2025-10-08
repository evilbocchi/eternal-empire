import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import UnleashedConveyor from "shared/item/traits/conveyor/UnleashedConveyor";
import Class0Shop from "../Class0Shop";

export = new Item(script.Name)
    .setName("Unleashed Conversion Ramp")
    .setDescription("Bringing your droplets above ground has never been faster. May be slightly steeper, though.")
    .setDifficulty(Difficulty.Locomotion)
    .setPrice(new CurrencyBundle().set("Bitcoin", 10000), 1, 30)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .soldAt(Class0Shop)
    .persists("Skillification")

    .trait(Conveyor)
    .setSpeed(9)

    .trait(UnleashedConveyor)
    .exit();
