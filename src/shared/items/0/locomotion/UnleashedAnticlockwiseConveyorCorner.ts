import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import UnleashedConveyor from "shared/item/traits/conveyor/UnleashedConveyor";

export = new Item(script.Name)
    .setName("Unleashed Anti-clockwise Conveyor Corner")
    .setDescription(
        "The OSC went a little crazy this time with the naming scheme. Tinted orange just for your anti-clockwise needs.",
    )
    .setDifficulty(Difficulty.Locomotion)
    .setPrice(new CurrencyBundle().set("Power", 4e15), 1, 30)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .persists("Skillification")

    .trait(Conveyor)
    .setSpeed(9)

    .trait(UnleashedConveyor)
    .exit();
