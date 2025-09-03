import Difficulty from "@antivivi/jjt-difficulties";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import OmniUpgrader from "shared/item/traits/upgrader/OmniUpgrader";
import Crystal from "shared/items/excavation/Crystal";
import ExcavationStone from "shared/items/excavation/ExcavationStone";
import Iron from "shared/items/excavation/Iron";
import WhiteGem from "shared/items/excavation/WhiteGem";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Polarized Refiner")
    .setDescription(
        "The result of combining two upgraders together, with a harmful side effect. The green laser gives a x2 Funds boost while the yellow laser gives a x2 Power boost. The middle laser, however, negates all boosts and makes the droplet worthless.",
    )
    .setDifficulty(Difficulty.A)
    .setPrice(new CurrencyBundle().set("Funds", 2e12), 1)
    .setRequiredItemAmount(ExcavationStone, 40)
    .setRequiredItemAmount(WhiteGem, 20)
    .setRequiredItemAmount(Crystal, 15)
    .setRequiredItemAmount(Iron, 2)
    .addPlaceableArea("BarrenIslands")
    .setCreator("simple13579")
    .persists()

    .trait(OmniUpgrader)
    .setMuls(
        new Map([
            ["FundsLaser", new CurrencyBundle().set("Funds", 2)],
            ["PowerLaser", new CurrencyBundle().set("Power", 2)],
            ["NoneLaser", new CurrencyBundle().set("Funds", 0).set("Power", 0)],
        ]),
    )

    .trait(Conveyor)
    .setSpeed(5)

    .exit();
