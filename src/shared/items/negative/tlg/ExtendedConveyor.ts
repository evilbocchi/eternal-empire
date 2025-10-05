import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Extended Conveyor")
    .setDescription("A slightly longer conveyor than usual. Has walls that make droplets unable to change directions.")
    .setDifficulty(Difficulty.TheLowerGap)
    .setPrice(new CurrencyBundle().set("Funds", 65), 1, 10)
    .addPlaceableArea("BarrenIslands")

    .trait(Conveyor)
    .setSpeed(5)
    .exit();
