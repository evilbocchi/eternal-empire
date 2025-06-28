import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Bin from "shared/item/traits/Bin";

export = new Item(script.Name)
    .setName("Money Bin")
    .setDescription("A bin that collects money while you are offline.")
    .setDifficulty(Difficulty.Automatic)
    .setPrice(new CurrencyBundle().set("Funds", 90e39), 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .setCreator("simple13579")

    .trait(Bin)
    .setMul(new CurrencyBundle().set("Funds", 0.1))

    .exit();
