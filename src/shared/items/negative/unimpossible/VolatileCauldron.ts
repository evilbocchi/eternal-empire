import Difficulty from "@antivivi/jjt-difficulties";
import Furnace from "shared/item/traits/Furnace";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Volatile Cauldron")
    .setDescription("A cauldron giving... some multiplier of Funds? I don't know.")
    .setDifficulty(Difficulty.Unimpossible)
    .setPrice(new CurrencyBundle().set("Funds", 700000), 1)
    .addPlaceableArea("BarrenIslands")

    .trait(Furnace)
    .acceptsUpgrades(false)
    .setMul(new CurrencyBundle().set("Funds", 300))
    .setVariance(0.4)

    .exit();