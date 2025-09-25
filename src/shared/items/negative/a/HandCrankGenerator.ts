import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import HandCrank from "shared/item/traits/action/HandCrank";
import Generator from "shared/item/traits/generator/Generator";

export = new Item(script.Name)
    .setName("Hand Crank Generator")
    .setDescription(
        "Did you enjoy the Hand Crank Dropper? If so, you'll love the all-new Hand Crank Generator! Produces %gain%, tripling its stats when cranked.",
    )
    .setDifficulty(Difficulty.A)
    .setPrice(new CurrencyBundle().set("Power", 104000), 1)
    .setPrice(new CurrencyBundle().set("Power", 648100), 2)
    .addPlaceableArea("BarrenIslands")

    .trait(Generator)
    .setPassiveGain(new CurrencyBundle().set("Power", 26).set("Funds", 1e9))

    .trait(HandCrank)
    .setCallback((t, model) => model.SetAttribute("GeneratorBoost", t < 10 ? 3 : 1))

    .exit();
