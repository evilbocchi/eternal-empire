import Difficulty from "@antivivi/jjt-difficulties";
import { OnoeNum } from "@antivivi/serikanum";
import { RESET_LAYERS } from "shared/ResetLayer";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/Conveyor";
import Upgrader from "shared/item/traits/Upgrader";
import Formula from "shared/currency/Formula";
import { GameAPI } from "shared/item/ItemUtils";

const mul = new CurrencyBundle().set("Skill", 0);

export = new Item(script.Name)
    .setName("Skill Normalizer")
    .setDescription("Boosts Skill gain of droplets based on how much you would gain on skillification. There's no going back now...")
    .setDifficulty(Difficulty.JustAir)
    .setPrice(new CurrencyBundle().set("Funds", 1.4e30).set("Power", 100e15).set("Skill", 10), 1)
    .addPlaceableArea("SlamoVillage")

    .setFormula(new Formula().div(6).add(1))
    .setFormulaX("skillify")

    .trait(Upgrader)
    .applyFormula((v, item) => item.setMul(mul.set("Skill", v.mul(1))), () => {
        const amount = GameAPI.resetService.getResetReward(RESET_LAYERS.Skillification)?.get("Skill");
        return amount === undefined ? new OnoeNum(1) : amount;
    })

    .trait(Conveyor)
    .setSpeed(3)

    .exit();