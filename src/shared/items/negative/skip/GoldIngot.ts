import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Gold from "shared/items/excavation/Gold";

export = new Item(script.Name)
    .setName("Gold Ingot")
    .setDescription("A refined ingot made from pure gold.")
    .setDifficulty(Difficulty.Skip)
    .setPrice(new CurrencyBundle().set("Power", 4_294_967_296))
    .setRequiredItemAmount(Gold, 6)
    .placeableEverywhere()
    .persists();
