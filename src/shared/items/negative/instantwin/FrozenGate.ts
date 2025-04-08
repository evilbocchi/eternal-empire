import Difficulty from "@antivivi/jjt-difficulties";
import Conveyor from "shared/item/traits/Conveyor";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/Upgrader";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Frozen Gate")
    .setDescription("The hands of time stay frozen for this elusive machinery, boosting droplet values by %mul%.")
    .setDifficulty(Difficulty.InstantWin)
    .setPrice(new CurrencyBundle().set("Funds", 1.38e21), 1)
    .addPlaceableArea("BarrenIslands")

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 4).set("Power", 4))

    .trait(Conveyor)
    .setSpeed(2)

    .exit();