import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import InstantiationDelimiter from "shared/item/traits/InstantiationDelimiter";
import ClassLowerNegativeShop from "shared/items/negative/ClassLowerNegativeShop";

export = new Item(script.Name)
    .setName("Instantiation Delimiter I")
    .setDescription("Increases droplet limit by 20, but uses %drain%.")
    .setDifficulty(Difficulty.Negativity)
    .setPrice(new CurrencyBundle().set("Funds", 100000), 1)
    .addPlaceableArea("BarrenIslands")
    .soldAt(ClassLowerNegativeShop)

    .setDrain(new CurrencyBundle().set("Funds", 15))

    .trait(InstantiationDelimiter)
    .setDropletIncrease(20)

    .exit();
