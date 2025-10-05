import Difficulty from "@rbxts/ejt";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Droplet Electron Infuser")
    .setDescription("Now we're talking. Droplets passing through this upgrader gain %add% in value.")
    .setDifficulty(Difficulty.TrueEase)
    .setPrice(new CurrencyBundle().set("Power", 1500), 1)
    .addPlaceableArea("BarrenIslands")

    .trait(Upgrader)
    .setAdd(new CurrencyBundle().set("Power", 2))

    .trait(Conveyor)
    .setSpeed(3)

    .exit();
