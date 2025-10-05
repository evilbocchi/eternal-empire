import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Generator from "shared/item/traits/generator/Generator";
import DropperBooster from "shared/item/traits/boost/DropperBooster";

export = new Item(script.Name)
    .setName("Canistering Generator")
    .setDescription(
        "Boosts the drop rate of any dropper adjacent to the canister's vent by 2.5 times! Also produces %gain%.",
    )
    .setDifficulty(Difficulty.Vintage)
    .setPrice(new CurrencyBundle().set("Power", 200e15).set("Bitcoin", 76000), 1)
    .addPlaceableArea("BarrenIslands")

    .trait(Generator)
    .setPassiveGain(new CurrencyBundle().set("Power", 400e6))

    .trait(DropperBooster)
    .setDropRateMul(2.5)

    .exit();
