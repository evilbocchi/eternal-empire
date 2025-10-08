import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Printer from "shared/item/traits/Printer";
import Class0Shop from "../Class0Shop";

export = new Item(script.Name)
    .setName("Basic Printer")
    .setDescription(
        "Able to save placed items and their positions in Barren Islands, which can be loaded at any time. Any items that are not available when loading will be ignored.",
    )
    .setDifficulty(Difficulty.Millisecondless)
    .setPrice(new CurrencyBundle().set("Funds", 800e18), 1)
    .addPlaceableArea("SlamoVillage")
    .soldAt(Class0Shop)

    .trait(Printer)
    .setArea("BarrenIslands")

    .exit();
