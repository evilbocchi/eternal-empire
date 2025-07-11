import Difficulty from "@antivivi/jjt-difficulties";
import { OnoeNum } from "@antivivi/serikanum";
import Generator from "shared/item/Generator";
import AdvancedBlankEssence from "shared/items/0/ifinitude/AdvancedBlankEssence";
import PassiveBonanza from "shared/items/negative/instantwin/PassiveBonanza";
import Price from "shared/Price";
import Formula from "shared/utils/Formula";
import { GameUtils } from "shared/utils/ItemUtils";

const amt = new OnoeNum(4e9);
const base = new Price().setCost("Power", amt);

export = new Generator(script.Name)
    .setName("Corrupted Bonanza")
    .setDescription("Extracting a descending shadow, you find yourself trembling in quiet fear. Produces %gain%, this amount increasing with Skill. Caps at %cap%.")
    .setDifficulty(Difficulty.Ifinitude)
    .setRequiredItemAmount(AdvancedBlankEssence, 1)
    .setRequiredItemAmount(PassiveBonanza, 1)
    .setPrice(new Price().setCost("Skill", 30), 1)
    .addPlaceableArea("BarrenIslands")

    .setPassiveGain(base)
    .ambienceSound((model) => (model.WaitForChild("Hitbox").WaitForChild("Sound") as Sound))
    .setFormula(new Formula().pow(0.75).div(3).add(1))
    .setFormulaX("skill")
    .setFormulaXCap(new Price().setCost("Skill", 1e6))
    .applyFormula((v, item) => item.setPassiveGain(base.setCost("Power", amt.mul(v))), () => GameUtils.currencyService.getCost("Skill"));