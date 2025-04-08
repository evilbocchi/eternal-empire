import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Charger from "shared/item/traits/Charger";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Tesseract Booster")
    .setDescription("Does what it says, boosting Dark Matter gain of tesseracts in a 12 stud radius by x2.")
    .setDifficulty(Difficulty.DoNothing)
    .setPrice(new CurrencyBundle().set("Bitcoin", 2600), 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .persists("Skillification")
    .setCreator("emoronq2k")

    .trait(Charger)
    .setRadius(12)
    .setMul(new CurrencyBundle().set("Dark Matter", 2))

    .exit();