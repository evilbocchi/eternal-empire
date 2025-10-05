import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import AdvancedRefiner from "shared/items/negative/a/AdvancedRefiner";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Purifier's Refiner")
    .setDescription(
        "Upgrade one of your Advanced Refiners, keeping its original boosts while adding %add% value to droplets.",
    )
    .setDifficulty(Difficulty.Exist)
    .setPrice(new CurrencyBundle().set("Funds", 4e15), 1)
    .setRequiredItemAmount(AdvancedRefiner, 1)
    .addPlaceableArea("BarrenIslands")

    .trait(Upgrader)
    .setAdd(new CurrencyBundle().set("Purifier Clicks", 1))
    .setMul(new CurrencyBundle().set("Funds", 1.75).set("Power", 1.75))

    .exit();
