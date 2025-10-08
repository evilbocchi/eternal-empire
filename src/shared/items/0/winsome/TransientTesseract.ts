import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Generator from "shared/item/traits/generator/Generator";
import Item from "shared/item/Item";
import Class0Shop from "../Class0Shop";

export = new Item(script.Name)
    .setName("Transient Tesseract")
    .setDescription("Trying its best to exist. Produces %gain%.")
    .setDifficulty(Difficulty.Winsome)
    .setPrice(new CurrencyBundle().set("Skill", 7), 1, 3)
    .addPlaceableArea("BarrenIslands")
    .soldAt(Class0Shop)

    .trait(Generator)
    .setPassiveGain(new CurrencyBundle().set("Dark Matter", 6496))

    .exit();
