import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import SlamoStore from "shared/items/0/millisecondless/SlamoStore";

export = new Item(script.Name)
    .setName("jWood")
    .setDescription("Joke wood. It's not real wood.")
    .setDifficulty(Difficulty.Millisecondless)
    .addPlaceableArea("SlamoVillage")
    .soldAt(SlamoStore)
    .setPrice(new CurrencyBundle().set("Funds", 1e24))
    .persists();
