import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Shop from "shared/item/traits/Shop";

export = new Item(script.Name)
    .setName("Class 0 Shop")
    .setDescription("Buy your favorite Millisecondless to Spontaneous items here!")
    .setDifficulty(Difficulty.Millisecondless)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .setPrice(new CurrencyBundle().set("Skill", 0.1), 1, 5)
    .persists()

    .trait(Shop)
    .exit();
