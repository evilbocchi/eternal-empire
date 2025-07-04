import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Conveyor from "shared/item/traits/Conveyor";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/Upgrader";
import Formula from "shared/currency/Formula";
import { Server } from "shared/item/ItemUtils";

const mul = new CurrencyBundle().set("Funds", 0);

export = new Item(script.Name)
    .setName("Funds Accelerator")
    .setDescription("Progress is slow? No longer. Boosts Funds gain, with that multiplier increasing by Funds.")
    .setDifficulty(Difficulty.Walkthrough)
    .setPrice(new CurrencyBundle().set("Funds", 200e33).set("Skill", 1200), 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .persists("Skillification")

    .setFormula(new Formula().div(1e30).add(1).pow(0.1))
    .setFormulaX("funds")

    .trait(Upgrader)
    .applyFormula((v, item) => item.setMul(mul.set("Funds", v)), () => Server.Currency.get("Funds"))

    .trait(Conveyor)
    .setSpeed(4)

    .exit();