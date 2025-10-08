import Difficulty from "@rbxts/ejt";
import { OnoeNum } from "@rbxts/serikanum";
import { RESET_LAYERS } from "shared/currency/mechanics/ResetLayer";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import Formula from "shared/currency/Formula";
import { Server } from "shared/api/APIExpose";
import Class0Shop from "shared/items/0/Class0Shop";

const mul = new CurrencyBundle().set("Skill", 0);

export = new Item(script.Name)
    .setName("Skill Normalizer")
    .setDescription(
        "Boosts Skill gain of droplets based on how much you would gain on skillification. There's no going back now...",
    )
    .setDifficulty(Difficulty.JustAir)
    .setPrice(new CurrencyBundle().set("Funds", 1.4e30).set("Power", 100e15).set("Skill", 10), 1)
    .addPlaceableArea("SlamoVillage")
    .soldAt(Class0Shop)

    .setFormula(new Formula().div(6).add(1))
    .setFormulaX("skillify")

    .trait(Upgrader)
    .applyFormula(
        (v, item) => item.setMul(mul.set("Skill", v)),
        () => {
            const amount = Server.Reset.getResetReward(RESET_LAYERS.Skillification)?.get("Skill");
            return amount === undefined ? new OnoeNum(1) : amount;
        },
    )

    .trait(Conveyor)
    .setSpeed(3)

    .exit();
