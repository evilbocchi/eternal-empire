import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Charger from "shared/item/traits/Charger";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Basic Charger")
    .setDescription("Boosts gain of generators within %radius% studs radius of this charger by %mul%. Generators can only be charged two times.")
    .setDifficulty(Difficulty.TrueEase)
    .setPrice(new CurrencyBundle().set("Funds", 3500000000).set("Power", 100), 1)
    .setPrice(new CurrencyBundle().set("Funds", 5000000000).set("Power", 160), 2)
    .setPrice(new CurrencyBundle().set("Funds", 12000000000).set("Power", 300), 3)
    .addPlaceableArea("BarrenIslands")

    .trait(Charger)
    .setRadius(9)
    .setMul(new CurrencyBundle().set("Power", 2))

    .exit();