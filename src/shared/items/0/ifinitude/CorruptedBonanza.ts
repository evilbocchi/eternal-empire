import Difficulty from "@antivivi/jjt-difficulties";
import { OnoeNum } from "@antivivi/serikanum";
import Generator from "shared/item/traits/Generator";
import Item from "shared/item/Item";
import AdvancedBlankEssence from "shared/items/0/ifinitude/AdvancedBlankEssence";
import PassiveBonanza from "shared/items/negative/instantwin/PassiveBonanza";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Formula from "shared/currency/Formula";
import { GameAPI } from "shared/item/ItemUtils";

const amt = new OnoeNum(4e9);
const base = new CurrencyBundle().set("Power", amt);

export = new Item(script.Name)
    .setName("Corrupted Bonanza")
    .setDescription("Extracting a descending shadow, you find yourself trembling in quiet fear. Produces %gain%, this amount increasing with Skill. Caps at %cap%.")
    .setDifficulty(Difficulty.Ifinitude)
    .setRequiredItemAmount(AdvancedBlankEssence, 1)
    .setRequiredItemAmount(PassiveBonanza, 1)
    .setPrice(new CurrencyBundle().set("Skill", 30), 1)
    .addPlaceableArea("BarrenIslands")

    .setFormula(new Formula().pow(0.75).div(3).add(1))
    .setFormulaX("skill")
    .setFormulaXCap(new CurrencyBundle().set("Skill", 1e6))

    .trait(Generator)
    .setPassiveGain(base)
    .applyFormula((v, item) => item.setPassiveGain(base.set("Power", amt.mul(v))), () => GameAPI.currencyService.get("Skill"))

    .exit();