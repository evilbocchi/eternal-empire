import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import Shop from "shared/item/traits/Shop";

export = new Item(script.Name)
    .setName("Slamo Store")
    .setDifficulty(Difficulty.Millisecondless)

    .trait(Shop)
    .exit();
