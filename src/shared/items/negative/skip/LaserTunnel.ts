import Difficulty from "@antivivi/jjt-difficulties";
import Conveyor from "shared/item/traits/Conveyor";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/Upgrader";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import LaserFan from "../unimpossible/LaserFan";

export = new Item(script.Name)
    .setName("Laser Tunnel")
    .setDescription("No more convoluted structures to accomodate for the Laser Fans anymore. Boost droplet value by %mul%.")
    .setDifficulty(Difficulty.Skip)
    .setPrice(new CurrencyBundle().set("Power", 3.3e9), 1)
    .setRequiredItemAmount(LaserFan, 2)
    .addPlaceableArea("BarrenIslands")

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 10).set("Power", 3))

    .trait(Conveyor)
    .setSpeed(2)

    .exit();