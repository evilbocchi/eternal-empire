import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Charm from "shared/item/traits/Charm";
import Glass from "shared/items/0/millisecondless/Glass";
import MagicalCraftingTable from "shared/items/0/millisecondless/MagicalCraftingTable";
import WinsomeCoagulate from "shared/items/0/winsome/WinsomeCoagulate";
import EnchantedGrass from "shared/items/negative/tlg/EnchantedGrass";

export = new Item(script.Name)
    .setName("Winsome Charm")
    .setDescription(
        "If you're ever feeling down, just know that Winsome is here for you. +3% chance to inflict critical hits with tools.",
    )
    .setDifficulty(Difficulty.Winsome)
    .setPrice(new CurrencyBundle().set("Funds", 1), 1)
    .setRequiredItemAmount(WinsomeCoagulate, 2)
    .setRequiredItemAmount(Glass, 1)
    .setRequiredItemAmount(EnchantedGrass, 10)
    .soldAt(MagicalCraftingTable)

    .trait(Charm)
    .setCriticalAdd(3)

    .exit();
