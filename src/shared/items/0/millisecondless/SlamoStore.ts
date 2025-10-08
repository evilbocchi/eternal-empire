import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import Shop from "shared/item/traits/Shop";
import Class0Shop from "shared/items/0/Class0Shop";
import Glass from "shared/items/0/millisecondless/Glass";
import Stone from "shared/items/0/millisecondless/Stone";
import Wood from "shared/items/0/millisecondless/Wood";

export = new Item(script.Name)
    .setName("Slamo Store")
    .setDifficulty(Difficulty.Millisecondless)

    .trait(Shop)
    .setItems([Class0Shop, Wood, Stone, Glass])

    .exit();
