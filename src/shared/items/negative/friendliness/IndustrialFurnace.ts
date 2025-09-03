import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Furnace from "shared/item/traits/Furnace";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Industrial Furnace")
    .setDescription("A solid furnace, boasting an amazing %mul% boost.")
    .setDifficulty(Difficulty.Friendliness)
    .setPrice(new CurrencyBundle().set("Funds", 440000000), 1)
    .addPlaceableArea("BarrenIslands")

    .trait(Furnace)
    .setMul(new CurrencyBundle().set("Funds", 250))

    .exit();
