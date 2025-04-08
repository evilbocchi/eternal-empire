import Difficulty from "@antivivi/jjt-difficulties";
import Charger from "shared/item/traits/Charger";
import Item from "shared/item/Item";
import ExcavationStone from "shared/items/excavation/ExcavationStone";
import WhiteGem from "shared/items/excavation/WhiteGem";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Tesla Charger")
    .setDescription("Boosts Power gain of generators within 9 studs radius of this charger by 2.5x.")
    .setDifficulty(Difficulty.Miscellaneous)
    .setRequiredItemAmount(ExcavationStone, 20)
    .setRequiredItemAmount(WhiteGem, 15)
    .setPrice(new CurrencyBundle().set("Power", 1000))
    .addPlaceableArea("BarrenIslands")
    .setCreator("simple13579")

    .trait(Charger)
    .setRadius(9)
    .setMul(new CurrencyBundle().set("Power", 2.5))

    .exit();