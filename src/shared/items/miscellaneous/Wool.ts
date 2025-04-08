import Difficulty from "@antivivi/jjt-difficulties";
import Item from "shared/item/Item";
import Shop from "shared/item/traits/Shop";
import CurrencyBundle from "shared/currency/CurrencyBundle";

const item = new Item("Wool")
    .setName("Wool")
    .setDescription("Wool for the masses.")
    .setDifficulty(Difficulty.Miscellaneous)
    .setPrice(new CurrencyBundle().set("Funds", 24e12).set("Power", 100));

item.trait(Shop).setItems([item]);

export = item;