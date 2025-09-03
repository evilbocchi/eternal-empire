import Difficulty from "@antivivi/jjt-difficulties";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Void Sky Upgrader")
    .setDescription(
        "Reaching the skies? That was only a dream until now. %mul% droplet value for a cherry on top. You can drop upgraded droplets into cauldrons now, but at a reduced value (1/250).",
    )
    .setDifficulty(Difficulty.Happylike)
    .setPrice(new CurrencyBundle().set("Funds", 35e30), 1)
    .addPlaceableArea("BarrenIslands")
    .setCreator("CoPKaDT")

    .trait(Upgrader)
    .setSky(true)
    .setMul(new CurrencyBundle().set("Funds", 1.75))

    .trait(Conveyor)
    .setSpeed(8)

    .exit();
