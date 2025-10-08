import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import Dropper from "shared/item/traits/dropper/Dropper";
import ClassLowerNegativeShop from "shared/items/negative/ClassLowerNegativeShop";

export = new Item(script.Name)
    .setName("Grass Dropper")
    .setDescription(
        "You need more grass. A Grass Droplet from this dropper touching a Grass Conveyor transforms it into a Massive Grass Droplet worth $550.",
    )
    .setDifficulty(Difficulty.Friendliness)
    .setPrice(new CurrencyBundle().set("Funds", 34500000), 1)
    .setPrice(new CurrencyBundle().set("Funds", 80000000), 2)
    .addPlaceableArea("BarrenIslands")
    .soldAt(ClassLowerNegativeShop)

    .trait(Dropper)
    .setDroplet(Droplet.NativeGrassDroplet)
    .setDropRate(1)

    .exit();
