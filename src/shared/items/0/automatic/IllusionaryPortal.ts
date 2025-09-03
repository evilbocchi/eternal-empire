import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Portal from "shared/item/traits/upgrader/Portal";

export = new Item(script.Name)
    .setName("Illusionary Portal")
    .setDescription(
        "Pass droplets through the black void, and it comes out through the radiant end. This is the power of teleportation.",
    )
    .setDifficulty(Difficulty.Automatic)
    .setPrice(new CurrencyBundle().set("Funds", 22.5e39), 1)
    .setPrice(new CurrencyBundle().set("Funds", 22.5e36), 2)
    .addPlaceableArea("BarrenIslands", "SlamoVillage", "SkyPavilion")
    .setCreator("simple13579")

    .trait(Portal)
    .trait(Conveyor)
    .setSpeed(5)

    .exit();
