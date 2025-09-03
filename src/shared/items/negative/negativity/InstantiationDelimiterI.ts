import Difficulty from "@antivivi/jjt-difficulties";
import InstantiationDelimiter from "shared/item/traits/InstantiationDelimiter";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Instantiation Delimiter I")
    .setDescription("Increases droplet limit by 20, but uses %drain%.")
    .setDifficulty(Difficulty.Negativity)
    .setPrice(new CurrencyBundle().set("Funds", 100000), 1)
    .addPlaceableArea("BarrenIslands")

    .setDrain(new CurrencyBundle().set("Funds", 15))

    .trait(InstantiationDelimiter)
    .setDropletIncrease(20)

    .exit();
