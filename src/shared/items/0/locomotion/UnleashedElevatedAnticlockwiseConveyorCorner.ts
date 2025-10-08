import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import UnleashedConveyor from "shared/item/traits/conveyor/UnleashedConveyor";
import Class0Shop from "../Class0Shop";

export = new Item(script.Name)
    .setName("Unleashed Elevated Anti-clockwise Conveyor Corner")
    .setDescription("Why is this a name? Who wrote this and thought this was a good idea?")
    .setDifficulty(Difficulty.Locomotion)
    .setPrice(new CurrencyBundle().set("Skill", 12), 1, 30)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .soldAt(Class0Shop)
    .persists("Skillification")

    .trait(Conveyor)
    .setSpeed(9)

    .trait(UnleashedConveyor)
    .exit();
