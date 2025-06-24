import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/Conveyor";
import { Grounder } from "shared/item/traits/status/Massless";
import Upgrader from "shared/item/traits/Upgrader";


export = new Item(script.Name)
    .setName("Gravity Grounder")
    .setDescription("Brings anti-gravity droplets to the ground, removing the %massless% effect and its buffs.")
    .setDifficulty(Difficulty.Joyful)
    .setPrice(new CurrencyBundle().set("Funds", 15), 1)
    .setPrice(new CurrencyBundle().set("Funds", 15e21), 2)
    .setPrice(new CurrencyBundle().set("Funds", 15e42), 3)
    .setPrice(new CurrencyBundle().set("Funds", 15e63), 4)
    .setPrice(new CurrencyBundle().set("Funds", 15e84), 5)
    .setCreator("sanjay2133")
    .addPlaceableArea("BarrenIslands", "SlamoVillage", "SkyPavilion")

    .trait(Conveyor)
    .setSpeed(4)

    .trait(Upgrader)
    .trait(Grounder)

    .exit();