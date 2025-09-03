import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import Crystal from "shared/items/excavation/Crystal";
import Gold from "shared/items/excavation/Gold";
import Iron from "shared/items/excavation/Iron";

export = new Item(script.Name)
    .setName("Gilded Staircase")
    .setDescription(
        "Provides your droplets a fun ride up to the sky level all confined within this 9x9 space! Also provides a %mul% boost to droplets.",
    )
    .setDifficulty(Difficulty.AutomaticJoyful)
    .setPrice(new CurrencyBundle().set("Skill", 1000000), 1)
    .setRequiredItemAmount(Gold, 30)
    .setRequiredItemAmount(Iron, 50)
    .setRequiredItemAmount(Crystal, 100)
    .setCreator("sanjay2133")
    .addPlaceableArea("BarrenIslands", "SlamoVillage", "SkyPavilion")
    .persists()

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Skill", 1.5))

    .trait(Conveyor)
    .setSpeed(7)

    .exit();
