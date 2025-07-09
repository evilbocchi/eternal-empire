import Difficulty from "@antivivi/jjt-difficulties";
import Item from "shared/item/Item";
import { LaserFan } from "shared/item/traits/special/LaserFan";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Laser Fan")
    .setDescription("Increases droplet value by %mul% compounding per blade.")
    .setDifficulty(Difficulty.Unimpossible)
    .setPrice(new CurrencyBundle().set("Funds", 150000), 1)
    .setPrice(new CurrencyBundle().set("Funds", 350000), 2)
    .addPlaceableArea("BarrenIslands")

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 1.3))
    .exit()

    .onLoad((model, item) => LaserFan.load(model, item));
