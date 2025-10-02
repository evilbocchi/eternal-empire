import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import HandCrank from "shared/item/traits/action/HandCrank";
import Boostable from "shared/item/traits/boost/Boostable";
import Generator from "shared/item/traits/generator/Generator";

const key = "HandCrank";

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
    .setBounceEffectEnabled(false) // conflicts with hand crank
    .setPassiveGain(new CurrencyBundle().set("Power", 26).set("Funds", 1e9))

    .trait(HandCrank)
    .setCallback((t, _, modelInfo) => {
        if (t < 5) {
            if (Boostable.hasBoost(modelInfo, key)) return;
            Boostable.addBoost(modelInfo, key, {
                ignoresLimitations: true,
                generatorCompound: { mul: new CurrencyBundle().set("Funds", 3).set("Power", 3) },
            });
        } else {
            Boostable.removeBoost(modelInfo, key);
        }
    })

    .exit();
