import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import UnleashedConveyor from "shared/item/traits/conveyor/UnleashedConveyor";
import Upgrader from "shared/item/traits/upgrader/Upgrader";

export = new Item(script.Name)
    .setName("Unleashed Sky Ramp")
    .setDescription("After the creation of the Void Sky Upgrader, scientists realised what they had to do. After running 20 million tests attempting to copy its exact characteristics, this was the fruition of their results.")
    .setDifficulty(Difficulty.Locomotion)
    .setPrice(new CurrencyBundle().set("Skill", 6).set("Bitcoin", 20000), 1, 15)
    .setPrice(new CurrencyBundle().set("Skill", 12).set("Bitcoin", 60000), 16, 30)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .persists("Skillification")

    .trait(Upgrader)
    .setSky(true)

    .trait(Conveyor)
    .setSpeed(9)

    .trait(UnleashedConveyor)
    .exit();