import Difficulty from "@antivivi/jjt-difficulties";
import Item from "shared/item/Item";
import Generator from "shared/item/traits/generator/Generator";
import { HandCrank } from "shared/item/traits/action/HandCrank";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Hand Crank Generator")
    .setDescription("Did you enjoy the Hand Crank Dropper? If so, you'll love the all-new Hand Crank Generator! Produces %gain%, tripling its stats when cranked.")
    .setDifficulty(Difficulty.A)
    .setPrice(new CurrencyBundle().set("Power", 104000), 1)
    .setPrice(new CurrencyBundle().set("Power", 648100), 2)
    .addPlaceableArea("BarrenIslands")

    .trait(Generator)
    .setPassiveGain(new CurrencyBundle().set("Power", 26).set("Funds", 1e9))
    .exit()

    .onLoad((model) => {
        HandCrank.load(model, (t) => model.SetAttribute("GeneratorBoost", t < 10 ? 3 : 1));
    });