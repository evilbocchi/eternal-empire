import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Furnace from "shared/item/traits/Furnace";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Button Furnace")
    .setDescription("Doesn't actually press. Gives a sizeable %mul% bonus though.")
    .setDifficulty(Difficulty.Unimpossible)
    .setPrice(new CurrencyBundle().set("Funds", 700000), 1)
    .addPlaceableArea("BarrenIslands")

    .trait(Furnace)
    .setMul(new CurrencyBundle().set("Funds", 70))

    .exit();