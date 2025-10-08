import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Stone from "shared/items/0/millisecondless/Stone";
import Existenite from "shared/items/negative/exist/Existenite";
import DamascusSteelIngot from "shared/items/negative/relax/DamascusSteelIngot";
import Class0Shop from "shared/items/0/Class0Shop";

export = new Item(script.Name)
    .setName("Millirite")
    .setDescription("The essence of milliseconds.")
    .setDifficulty(Difficulty.Millisecondless)
    .setPrice(new CurrencyBundle().set("Power", 1))
    .setRequiredItemAmount(Existenite, 1)
    .setRequiredItemAmount(DamascusSteelIngot, 1)
    .setRequiredItemAmount(Stone, 50)
    .placeableEverywhere()
    .persists();
