import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/Conveyor";
import UnleashedConveyor from "shared/item/traits/special/UnleashedConveyor";
import Crystal from "shared/items/excavation/Crystal";

export = new Item(script.Name)
    .setName("Leashed Conveyor")
    .setDescription("Scientists have no idea why this conveyor is so fast. There seems to be some bumps in the center of the conveyor that push droplets to the side.")
    .setDifficulty(Difficulty.Locomotion)
    .setPrice(new CurrencyBundle().set("Funds", 1e27), 1, 5)
    .setRequiredItemAmount(Crystal, 2)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .persists()

    .trait(Conveyor)
    .setSpeed(9)

    .trait(UnleashedConveyor)
    .exit();