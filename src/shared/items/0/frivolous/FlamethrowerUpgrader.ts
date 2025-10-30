import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import Ablaze from "shared/item/traits/status/Ablaze";
import Class0Shop from "shared/items/0/Class0Shop";

export = new Item(script.Name)
    .setName("Flamethrower Upgrader")
    .setDescription(
        "Applies %ablaze% to droplets hit by the flamethrower, providing a flat x2 boost to ALL currencies. Deals damage over time.",
    )
    .setDifficulty(Difficulty.Frivolous)
    .setPrice(new CurrencyBundle().set("Purifier Clicks", 1e22), 1)
    .setPrice(new CurrencyBundle().set("Purifier Clicks", 1e24), 2)
    .addPlaceableArea("BarrenIslands")
    .soldAt(Class0Shop)

    .trait(Upgrader)
    .trait(Ablaze)

    .exit();
