import Difficulty from "@antivivi/jjt-difficulties";
import { OnoeNum } from "@antivivi/serikanum";
import { RESET_LAYERS } from "shared/constants";
import Upgrader from "shared/item/Upgrader";
import Price from "shared/Price";
import Formula from "shared/utils/Formula";
import { GameUtils } from "shared/utils/ItemUtils";

const mul = new Price().setCost("Skill", 0);

export = new Upgrader(script.Name)
    .setName("Skill Normalizer")
    .setDescription("Boosts Skill gain of droplets based on how much you would gain on skillification. There's no going back now...")
    .setDifficulty(Difficulty.JustAir)
    .setPrice(new Price().setCost("Funds", 1.4e30).setCost("Power", 100e15).setCost("Skill", 10), 1)
    .addPlaceableArea("SlamoVillage")

    .setSpeed(3)
    .setFormula(new Formula().div(6).add(1))
    .setFormulaX("skillify")
    .applyFormula((v, item) => item.setMul(mul.setCost("Skill", v.mul(1))), () => {
        const amount = GameUtils.resetService.getResetReward(RESET_LAYERS.Skillification)?.getCost("Skill");
        return amount === undefined ? new OnoeNum(1) : amount;
    });