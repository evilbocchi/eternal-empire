import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/Conveyor";
import UnleashedConveyor from "shared/item/traits/special/UnleashedConveyor";

export = new Item(script.Name)
    .setName("Unleashed Mini Conveyor")
    .setDescription(`The junior to the Unleashed Conveyor. Not much use other than inflating item count.`)
    .setDifficulty(Difficulty.Locomotion)
    .setPrice(new CurrencyBundle().set("Funds", 2e30), 1, 30)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .persists("Skillification")

    .trait(Conveyor)
    .setSpeed(9)

    .trait(UnleashedConveyor)
    .exit();