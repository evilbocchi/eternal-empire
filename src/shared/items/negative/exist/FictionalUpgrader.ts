import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Conveyor from "shared/item/traits/Conveyor";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/Upgrader";
import Crystal from "shared/items/excavation/Crystal";
import Iron from "shared/items/excavation/Iron";
import WhiteGem from "shared/items/excavation/WhiteGem";

export = new Item(script.Name)
    .setName("Fictional Upgrader")
    .setDescription("The epitome of trying to exist. Seems to boost droplet values by %mul%, but its gap can only fit 1x1 droplets.")
    .setDifficulty(Difficulty.Exist)
    .setPrice(new CurrencyBundle().set("Funds", 1e15), 1)
    .setRequiredItemAmount(WhiteGem, 20)
    .setRequiredItemAmount(Crystal, 10)
    .setRequiredItemAmount(Iron, 5)
    .addPlaceableArea("BarrenIslands")
    .setCreator("CoPKaDT")
    .persists()

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 1.5).set("Power", 1.25).set("Purifier Clicks", 2))

    .trait(Conveyor)
    .setSpeed(3)

    .exit();
