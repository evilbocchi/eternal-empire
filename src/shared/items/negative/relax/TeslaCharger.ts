import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Charger from "shared/item/traits/generator/Charger";
import ExcavationStone from "shared/items/excavation/ExcavationStone";
import WhiteGem from "shared/items/excavation/WhiteGem";

export = new Item(script.Name)
    .setName("Tesla Charger")
    .setDescription("Boosts Power gain of generators within %radius% studs radius of this charger by %mul%.")
    .setDifficulty(Difficulty.Relax)
    .setPrice(new CurrencyBundle().set("Funds", 2e18).set("Power", 500e6))
    .setRequiredItemAmount(ExcavationStone, 20)
    .setRequiredItemAmount(WhiteGem, 15)
    .addPlaceableArea("BarrenIslands")
    .setCreator("simple13579")
    .persists()

    .trait(Charger)
    .setRadius(9)
    .setMul(new CurrencyBundle().set("Power", 5))

    .exit();
