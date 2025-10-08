import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Charger from "shared/item/traits/generator/Charger";
import Item from "shared/item/Item";
import Class0Shop from "../Class0Shop";

export = new Item(script.Name)
    .setName("Tesseract Booster")
    .setDescription("Does what it says, boosting Dark Matter gain of tesseracts in a 12 stud radius by x2.")
    .setDifficulty(Difficulty.DoNothing)
    .setPrice(new CurrencyBundle().set("Bitcoin", 2600), 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .soldAt(Class0Shop)
    .persists("Skillification")
    .setCreator("emoronq2k")

    .trait(Charger)
    .setRadius(12)
    .setMul(new CurrencyBundle().set("Dark Matter", 2))

    .exit();
