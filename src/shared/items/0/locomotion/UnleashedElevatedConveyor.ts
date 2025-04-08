import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/Conveyor";
import UnleashedConveyor from "shared/item/traits/special/UnleashedConveyor";

export = new Item(script.Name)
    .setName("Unleashed Elevated Conveyor")
    .setDescription("Racing above ground, bringing your droplets via. aerial means.")
    .setDifficulty(Difficulty.Locomotion)
    .setPrice(new CurrencyBundle().set("Skill", 3), 1, 30)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .persists("Skillification")

    .trait(Conveyor)
    .setSpeed(9)

    .trait(UnleashedConveyor)
    .exit();