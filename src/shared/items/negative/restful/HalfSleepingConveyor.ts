import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Half Sleeping Conveyor")
    .setDescription("Didn't this item already exist?")
    .setDifficulty(Difficulty.Restful)
    .setPrice(new CurrencyBundle().set("Funds", 225e15), 1, 10)
    .addPlaceableArea("BarrenIslands")

    .trait(Conveyor)
    .setSpeed(3)

    .exit();