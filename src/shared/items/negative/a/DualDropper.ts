import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import Dropper from "shared/item/traits/dropper/Dropper";
import ClassLowerNegativeShop from "shared/items/negative/ClassLowerNegativeShop";

export = new Item(script.Name)
    .setName("Dual Dropper")
    .setDescription(
        "One day, a scientist realised that using the power of A, they could communize anything - and that included droppers. Thus, this amalgamation was born: one side producing $3.6K droplets, the other producing 4 W droplets, both per second.",
    )
    .setDifficulty(Difficulty.A)
    .setPrice(new CurrencyBundle().set("Funds", 2.78e12), 1)
    .setPrice(new CurrencyBundle().set("Funds", 4.1e12), 2)
    .addPlaceableArea("BarrenIslands")
    .soldAt(ClassLowerNegativeShop)

    .trait(Dropper)
    .setDroplet(Droplet.CommunismFundsDroplet)
    .setDroplet(Droplet.CommunismPowerDroplet, "PowerDrop")
    .setDropRate(1)

    .exit();
