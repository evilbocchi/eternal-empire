import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Shop from "shared/item/traits/Shop";

export = new Item(script.Name)
    .setName("Magical Crafting Table")
    .setDifficulty(Difficulty.Millisecondless)
    .setDescription(
        "A variant of the Crafting Table with more latent power, allowing you to craft more powerful items.",
    )
    .setPrice(new CurrencyBundle().set("Funds", 10e63), 1)
    .placeableEverywhere()
    .persists()

    .trait(Shop)
    .exit();
