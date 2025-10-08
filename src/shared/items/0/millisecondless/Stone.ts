import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import SlamoStore from "shared/items/0/millisecondless/SlamoStore";

export = new Item(script.Name)
    .setName("jRock")
    .setDescription("What's better than jWood? jRock.")
    .setDifficulty(Difficulty.Millisecondless)
    .addPlaceableArea("SlamoVillage")
    .soldAt(SlamoStore)
    .setPrice(new CurrencyBundle().set("Power", 1e15))
    .persists();
