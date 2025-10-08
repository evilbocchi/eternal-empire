import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import Dropper from "shared/item/traits/dropper/Dropper";
import ClassLowerNegativeShop from "shared/items/negative/ClassLowerNegativeShop";
import DepressingDropper from "shared/items/negative/ifinity/DepressingDropper";

export = new Item(script.Name)
    .setName("Power Compact Dropper")
    .setDescription(
        "You may have already realized, but you can't sell items back. Do you want Funds, or a dropper producing %val% droplets per second?",
    )
    .setDifficulty(Difficulty.Ifinity)
    .setPrice(new CurrencyBundle().set("Power", 1), 1)
    .setRequiredItemAmount(DepressingDropper, 1)
    .addPlaceableArea("BarrenIslands")
    .soldAt(ClassLowerNegativeShop)

    .trait(Dropper)
    .setDroplet(Droplet.PowerCompactDroplet)
    .setDropRate(1)

    .exit();
