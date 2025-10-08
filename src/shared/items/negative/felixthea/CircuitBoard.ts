import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Gold from "shared/items/excavation/Gold";
import Iron from "shared/items/excavation/Iron";
import BillonIngot from "shared/items/negative/friendliness/BillonIngot";
import CrystalIngot from "shared/items/negative/unimpossible/CrystalIngot";

export = new Item(script.Name)
    .setName("Circuit Board")
    .setDescription("A complex board used in advanced machinery.")
    .setDifficulty(Difficulty.FelixTheDA)
    .setPrice(new CurrencyBundle().set("Power", 1024))
    .setRequiredItemAmount(Iron, 4)
    .setRequiredItemAmount(Gold, 1)
    .setRequiredItemAmount(CrystalIngot, 1)
    .setRequiredItemAmount(BillonIngot, 1)
    .placeableEverywhere()
    .persists();
