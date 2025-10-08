import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Crystal from "shared/items/excavation/Crystal";
import Iron from "shared/items/excavation/Iron";
import WhiteGem from "shared/items/excavation/WhiteGem";
import Wool from "shared/items/negative/a/Wool";
import BillonIngot from "shared/items/negative/friendliness/BillonIngot";
import CrystalIngot from "shared/items/negative/unimpossible/CrystalIngot";

export = new Item(script.Name)
    .setName("Existenite")
    .setDescription("The essence of existence itself.")
    .setDifficulty(Difficulty.Exist)
    .setPrice(new CurrencyBundle().set("Power", 1))
    .setRequiredItemAmount(CrystalIngot, 1)
    .setRequiredItemAmount(BillonIngot, 1)
    .setRequiredItemAmount(Wool, 1)
    .setRequiredItemAmount(Iron, 1)
    .setRequiredItemAmount(Crystal, 1)
    .setRequiredItemAmount(WhiteGem, 1)
    .placeableEverywhere()
    .persists();
