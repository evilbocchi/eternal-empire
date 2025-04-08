import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("jWood")
    .setDescription("Joke wood. It's not real wood.")
    .setDifficulty(Difficulty.Millisecondless)
    .addPlaceableArea("SlamoVillage")
    .setPrice(new CurrencyBundle().set("Funds", 1e24));