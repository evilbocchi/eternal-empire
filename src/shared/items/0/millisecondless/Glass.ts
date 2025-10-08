import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import SlamoStore from "shared/items/0/millisecondless/SlamoStore";

export = new Item(script.Name)
    .setName("Glass")
    .setDescription("It didn't lie. This really is glass, costing quite the fortune.")
    .setDifficulty(Difficulty.Millisecondless)
    .addPlaceableArea("SlamoVillage")
    .soldAt(SlamoStore)
    .setPrice(new CurrencyBundle().set("Funds", 1e27).set("Power", 1e18));
