import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Glass")
    .setDescription("It didn't lie. This really is glass, costing quite the fortune.")
    .setDifficulty(Difficulty.Millisecondless)
    .addPlaceableArea("SlamoVillage")
    .setPrice(new CurrencyBundle().set("Funds", 1e27).set("Power", 1e18));
