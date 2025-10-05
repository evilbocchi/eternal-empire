import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import UnleashedConveyor from "shared/item/traits/conveyor/UnleashedConveyor";

export = new Item(script.Name)
    .setName("Unleashed Conveyor Corner")
    .setDescription(
        "An even more compact version of the original Conveyor Corner, re-invented by the Open Slamo Community (OSC). Blazingly fast!",
    )
    .setDifficulty(Difficulty.Locomotion)
    .setPrice(new CurrencyBundle().set("Power", 2e15), 1, 30)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .persists("Skillification")

    .trait(Conveyor)
    .setSpeed(9)

    .trait(UnleashedConveyor)
    .exit();
