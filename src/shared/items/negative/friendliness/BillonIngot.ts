import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Crystal from "shared/items/excavation/Crystal";
import WhiteGem from "shared/items/excavation/WhiteGem";
import CrystalIngot from "shared/items/negative/unimpossible/CrystalIngot";

export = new Item(script.Name)
    .setName("Billon Ingot")
    .setDescription("A shimmering alloy forged from crystal and white gems.")
    .setDifficulty(Difficulty.Friendliness)
    .setPrice(new CurrencyBundle().set("Power", 16))
    .setRequiredItemAmount(CrystalIngot, 1)
    .setRequiredItemAmount(Crystal, 1)
    .setRequiredItemAmount(WhiteGem, 1)
    .placeableEverywhere()
    .persists();
