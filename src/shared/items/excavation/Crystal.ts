import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import WhiteGem from "shared/items/excavation/WhiteGem";

export = new Item(script.Name)
    .setName("Crystal")
    .setDescription(
        "A precious metal made from the crystallization of liquid Amethyst in the low pressures of Sky Pavilion. Highly reactive with White Gems.",
    )
    .setDifficulty(Difficulty.Excavation)
    .setPrice(new CurrencyBundle().set("Power", 1))
    .setRequiredItemAmount(WhiteGem, 256)
    .placeableEverywhere()
    .persists();
