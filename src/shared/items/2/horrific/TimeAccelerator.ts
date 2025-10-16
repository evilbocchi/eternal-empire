import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import TimeShop from "shared/items/2/TimeShop";

export = new Item(script.Name)
    .setName("Time Accelerator")
    .setDescription("Pass droplets through this to boost them by %mul%.")
    .setDifficulty(Difficulty.Horrific)
    .setPrice(new CurrencyBundle().set("Time", 15), 1)
    .addPlaceableArea("MinerHaven")
    .soldAt(TimeShop)
    .setLevelReq(0)

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Time", 10000))

    .trait(Conveyor)
    .setSpeed(4)

    .exit();
