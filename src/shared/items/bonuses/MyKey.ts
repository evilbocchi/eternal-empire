import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("My Key.")
    .setDescription("Just for me.")
    .setDifficulty(Difficulty.Bonuses)
    .setPrice(new CurrencyBundle().set("Power", 1), 1);
