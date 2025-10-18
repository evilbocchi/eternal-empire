import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Furnace from "shared/item/traits/Furnace";

export = new Item(script.Name)
    .setName("All-Consuming Tub")
    .setDescription("Seems to absorb everything placed inside it, even time itself.")
    .setDifficulty(Difficulty.Anguish)
    .addPlaceableArea("MinerHaven")
    .setLevelReq(0)

    .trait(Furnace)
    .setMul(new CurrencyBundle().set("Time", 1))

    .exit();
