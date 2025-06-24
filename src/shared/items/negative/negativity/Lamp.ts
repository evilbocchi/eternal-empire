import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import ExcavationStone from "shared/items/excavation/ExcavationStone";

export = new Item(script.Name)
    .setName("Lamp")
    .setDescription("Provides visibility at night.")
    .setDifficulty(Difficulty.Negativity)
    .setPrice(new CurrencyBundle().set("Funds", 200))
    .setRequiredItemAmount(ExcavationStone, 10)
    .placeableEverywhere()
    .persists();