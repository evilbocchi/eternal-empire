import Difficulty from "@antivivi/jjt-difficulties";
import { OnoeNum } from "@antivivi/serikanum";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Formula from "shared/currency/Formula";
import Item from "shared/item/Item";
import { ServerAPI } from "shared/item/ItemUtils";
import Generator from "shared/item/traits/Generator";
import CorruptedBonanza from "shared/items/0/ifinitude/CorruptedBonanza";
import TimelostDesert from "shared/items/0/vibeness/TimelostDesert";
import CanisteringGenerator from "shared/items/0/vintage/CanisteringGenerator";
import TransientTesseract from "shared/items/0/winsome/TransientTesseract";
import HandCrankGenerator from "shared/items/negative/a/HandCrankGenerator";
import TheFirstGenerator from "shared/items/negative/friendliness/TheFirstGenerator";
import PeripheralGenerator from "shared/items/negative/reversedperipherality/PeripheralGenerator";
import UpgradedGenerator from "shared/items/negative/trueease/UpgradedGenerator";

const amt = new OnoeNum(1e18);
const base = new CurrencyBundle().set("Power", amt);

export = new Item(script.Name)
    .setName("Octahedral Temple")
    .setDescription(`The shape for optimal power generation. It is said that this temple was built by worshippers of the octahedron as a symbol of balance and harmony.
Now, it has been reduced to a mere generator, corrupted by the greed of those who seek to harness its power.

Produces %gain%, this amount increasing with Skill.`
    )
    .setDifficulty(Difficulty.Spontaneous)
    .setPrice(new CurrencyBundle().set("Funds", 2e45).set("Power", 1e30).set("Purifier Clicks", 1e30), 1)
    .setRequiredItemAmount(TheFirstGenerator, TheFirstGenerator.pricePerIteration.size())
    .setRequiredItemAmount(UpgradedGenerator, UpgradedGenerator.pricePerIteration.size())
    .setRequiredItemAmount(HandCrankGenerator, HandCrankGenerator.pricePerIteration.size())
    .setRequiredItemAmount(PeripheralGenerator, PeripheralGenerator.pricePerIteration.size())
    .setRequiredItemAmount(TransientTesseract, TransientTesseract.pricePerIteration.size())
    .setRequiredItemAmount(CanisteringGenerator, CanisteringGenerator.pricePerIteration.size())
    .setRequiredItemAmount(CorruptedBonanza, CorruptedBonanza.pricePerIteration.size())
    .setRequiredItemAmount(TimelostDesert, TimelostDesert.pricePerIteration.size())

    .addPlaceableArea("BarrenIslands")
    .setCreator("emoronq2k")

    .setFormula(new Formula().pow(0.25))
    .setFormulaX("skill")

    .trait(Generator)
    .setPassiveGain(base)
    .applyFormula((v, item) => {
        return item.setPassiveGain(base.set("Power", amt.mul(v)));
    }, () => ServerAPI.currencyService.get("Skill"))

    .exit();
