import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Charger from "shared/item/traits/generator/Charger";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Strong Charger")
    .setDescription("Boosts Power gain of generators within %radius% studs radius of this charger by %mul%. We need to charge.")
    .setDifficulty(Difficulty.JustAir)
    .setPrice(new CurrencyBundle().set("Funds", 16e30).set("Power", 300e15), 1)
    .setPrice(new CurrencyBundle().set("Funds", 44e30).set("Power", 700e15), 2)
    .addPlaceableArea("BarrenIslands")

    .trait(Charger)
    .setRadius(12)
    .setMul(new CurrencyBundle().set("Power", 6))

    .exit();