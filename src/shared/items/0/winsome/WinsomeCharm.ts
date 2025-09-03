import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Charm from "shared/item/traits/Charm";
import Item from "shared/item/Item";
import EnchantedGrass from "shared/items/excavation/harvestable/EnchantedGrass";

export = new Item(script.Name)
    .setName("Winsome Charm")
    .setDescription(
        "If you're ever feeling down, just know that Winsome is here for you. +3% chance to inflict critical hits with tools.",
    )
    .setDifficulty(Difficulty.Winsome)
    .setPrice(new CurrencyBundle().set("Funds", 1), 1)
    .setRequiredHarvestableAmount("WinsomeSpeck", 25)
    .setRequiredItemAmount(EnchantedGrass, 10)

    .trait(Charm)
    .setCriticalAdd(3)

    .exit();
