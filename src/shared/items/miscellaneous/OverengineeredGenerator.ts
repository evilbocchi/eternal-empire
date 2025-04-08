import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Generator from "shared/item/traits/Generator";
import Item from "shared/item/Item";
import ExcavationStone from "shared/items/excavation/ExcavationStone";
import WhiteGem from "shared/items/excavation/WhiteGem";

export = new Item(script.Name)
    .setName("Over-engineered Generator")
    .setDescription("Unnecessarily bulky, but produces a worth-while %gain%.")
    .setDifficulty(Difficulty.Miscellaneous)
    .setPrice(new CurrencyBundle().set("Funds", 1e9))
    .setRequiredItemAmount(ExcavationStone, 40)
    .setRequiredItemAmount(WhiteGem, 8)
    .addPlaceableArea("BarrenIslands")

    .trait(Generator)
    .setPassiveGain(new CurrencyBundle().set("Power", 15))

    .exit();