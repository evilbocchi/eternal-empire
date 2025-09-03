import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Dropper from "shared/item/traits/dropper/Dropper";
import Item from "shared/item/Item";
import DepressingDropper from "./DepressingDropper";

export = new Item(script.Name)
    .setName("Funds Compact Dropper")
    .setDescription(
        "Free! Just kidding. Go back and buy that Depressing Dropper for a dropper producing %val% droplets per second.",
    )
    .setDifficulty(Difficulty.Ifinity)
    .setPrice(new CurrencyBundle().set("Funds", 1), 1)
    .setRequiredItemAmount(DepressingDropper, 1)
    .addPlaceableArea("BarrenIslands")

    .trait(Dropper)
    .setDroplet(Droplet.FundsCompactDroplet)
    .setDropRate(1)

    .exit();
