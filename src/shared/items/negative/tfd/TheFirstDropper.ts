import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import Dropper from "shared/item/traits/dropper/Dropper";
import ClassLowerNegativeShop from "shared/items/negative/ClassLowerNegativeShop";

export = new Item(script.Name)
    .setName("The First Dropper")
    .setDescription("Produces droplets. Place this dropper above a furnace to start earning Funds.")
    .setDifficulty(Difficulty.TheFirstDifficulty)
    .setPrice(new CurrencyBundle().set("Funds", 0), 1)
    .setPrice(new CurrencyBundle().set("Funds", 10), 2)
    .setPrice(new CurrencyBundle().set("Funds", 55), 3)
    .addPlaceableArea("BarrenIslands")
    .soldAt(ClassLowerNegativeShop)

    .trait(Dropper)
    .setDroplet(Droplet.TheFirstDroplet)
    .setDropRate(1)

    .exit();
