import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Charger from "shared/item/traits/Charger";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Advanced Charger")
    .setDescription("Boosts Power gain of generators within %radius% studs radius of this charger by %mul%.")
    .setDifficulty(Difficulty.FelixTheA)
    .setPrice(new CurrencyBundle().set("Funds", 108e12).set("Power", 102000), 1)
    .setPrice(new CurrencyBundle().set("Funds", 226e12).set("Power", 320200), 2)
    .addPlaceableArea("BarrenIslands")

    .trait(Charger)
    .setRadius(11)
    .setMul(new CurrencyBundle().set("Power", 4))

    .exit();