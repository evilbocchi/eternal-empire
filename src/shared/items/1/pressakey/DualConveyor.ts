import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Dual Conveyor")
    .setDescription("A double conveyor for both ground and raised heights.")
    .setDifficulty(Difficulty.PressAKey)
    .setPrice(new CurrencyBundle().set("Funds", 35e39), 10)
    .addPlaceableArea("BarrenIslands", "SlamoVillage", "SkyPavilion")

    .trait(Conveyor)
    .setSpeed(5)

    .exit();
