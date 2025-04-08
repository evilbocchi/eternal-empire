import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/Conveyor";
import UnleashedConveyor from "shared/item/traits/special/UnleashedConveyor";
import Upgrader from "shared/item/traits/Upgrader";

export = new Item(script.Name)
    .setName("Unleashed Sky Conveyor")
    .setDescription("And now, a conveyor to convey your super-elevated droplets.")
    .setDifficulty(Difficulty.Locomotion)
    .setPrice(new CurrencyBundle().set("Skill", 12), 1, 15)
    .setPrice(new CurrencyBundle().set("Skill", 24), 16, 30)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .persists("Skillification")

    .trait(Upgrader)
    .setSky(true)

    .trait(Conveyor)
    .setSpeed(9)

    .trait(UnleashedConveyor)
    .exit();