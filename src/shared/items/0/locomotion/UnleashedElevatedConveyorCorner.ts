import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import UnleashedConveyor from "shared/item/traits/conveyor/UnleashedConveyor";
import Class0Shop from "../Class0Shop";

export = new Item(script.Name)
    .setName("Unleashed Elevated Conveyor Corner")
    .setDescription("Don't you love conveyor corners? Keep your droplets elevated while turning them with ease.")
    .setDifficulty(Difficulty.Locomotion)
    .setPrice(new CurrencyBundle().set("Skill", 6), 1, 30)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .soldAt(Class0Shop)
    .persists("Skillification")

    .trait(Conveyor)
    .setSpeed(9)

    .trait(UnleashedConveyor)
    .exit();
