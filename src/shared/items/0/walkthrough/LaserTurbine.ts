import Difficulty from "@antivivi/jjt-difficulties";
import Item from "shared/item/Item";
import { LaserFan } from "shared/item/traits/other/LaserFan";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Laser Turbine")
    .setDescription(
        `We heard you missed your old Laser Fans, so here's an "upgraded" model! Each fan blade gives %mul% compounding but can only hit droplets on raised conveyors.`,
    )
    .setDifficulty(Difficulty.Walkthrough)
    .setPrice(new CurrencyBundle().set("Funds", 50e33), 1)
    .setPrice(new CurrencyBundle().set("Funds", 150e33), 2)
    .addPlaceableArea("BarrenIslands")
    .setCreator("simple13579")

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 1.2))
    .exit()

    .onLoad((model, item) => LaserFan.load(model, item, 5));
