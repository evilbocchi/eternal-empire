import Difficulty from "@antivivi/jjt-difficulties";
import Charger from "shared/item/traits/generator/Charger";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Industrial Charger")
    .setDescription("Invented yet again by Speed Bobs, this charger doesn't count towards any charge limits, but only boosts Power by 1.25x in a 8 stud radius.")
    .setDifficulty(Difficulty.Relax)
    .setPrice(new CurrencyBundle().set("Funds", 1.8e18).set("Power", 1e9), 1)
    .setPrice(new CurrencyBundle().set("Funds", 3.3e18).set("Power", 1.4e9), 2)
    .addPlaceableArea("BarrenIslands")

    .trait(Charger)
    .ignoresLimit(true)
    .setRadius(8)
    .setMul(new CurrencyBundle().set("Power", 1.25))

    .exit();