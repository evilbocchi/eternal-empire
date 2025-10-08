import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import UnleashedConveyor from "shared/item/traits/conveyor/UnleashedConveyor";
import Class0Shop from "shared/items/0/Class0Shop";

export = new Item(script.Name)
    .setName("Unleashed Conveyor")
    .setDescription("Gone berserk, this conveyor is running at max speed to ensure your droplets are moved quickly.")
    .setDifficulty(Difficulty.Locomotion)
    .setPrice(new CurrencyBundle().set("Funds", 1e30), 1, 30)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .soldAt(Class0Shop)
    .persists("Skillification")

    .trait(Conveyor)
    .setSpeed(9)

    .trait(UnleashedConveyor)
    .exit();
