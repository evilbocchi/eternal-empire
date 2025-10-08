import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Shop from "shared/item/traits/Shop";

export = new Item(script.Name)
    .setName("Class 1 Shop")
    .setDescription("Buy your favorite Joyful to Effortlessless items here!")
    .setDifficulty(Difficulty.Joyful)
    .addPlaceableArea("BarrenIslands", "SlamoVillage", "SkyPavilion")
    .setPrice(new CurrencyBundle().set("Wins", 0.1), 1, 5)
    .persists()

    .trait(Shop)
    .exit();
