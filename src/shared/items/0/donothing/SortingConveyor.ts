import Difficulty from "@antivivi/jjt-difficulties";
import Conveyor from "shared/item/traits/Conveyor";
import Item from "shared/item/Item";
import ExcavationStone from "shared/items/excavation/ExcavationStone";
import WhiteGem from "shared/items/excavation/WhiteGem";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Sorting Conveyor")
    .setDescription("Sorts stuff... I don't know how this works either.")
    .setDifficulty(Difficulty.DoNothing)
    .setPrice(new CurrencyBundle().set("Funds", 8.2e27), 1)
    .setRequiredItemAmount(WhiteGem, 40)
    .setRequiredItemAmount(ExcavationStone, 20)
    .setCreator("CoPKaDT")
    .addPlaceableArea("BarrenIslands")
    .persists()

    .trait(Conveyor)
    .setSpeed(5)

    .exit();