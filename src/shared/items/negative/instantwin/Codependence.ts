import Difficulty from "@antivivi/jjt-difficulties";
import { OnoeNum } from "@antivivi/serikanum";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Charger from "shared/item/traits/generator/Charger";
import Item from "shared/item/Item";
import Formula from "shared/currency/Formula";
import { Server } from "shared/api/APIExpose";
import BasicBlankEssence from "./BasicBlankEssence";

const div = OnoeNum.fromSerika(5, 12);
const mul = new CurrencyBundle().set("Funds", 0).set("Power", 0);

export = new Item(script.Name)
    .setName("Codependence")
    .setDescription(
        "The solest form, bewitchering and blood-sucking. A charger that boosts Funds and Power with Power in its entire area, maxing out at %cap%. Ignores charge limits.",
    )
    .setDifficulty(Difficulty.InstantWin)
    .setPrice(new CurrencyBundle().set("Power", 1e12), 1)
    .setRequiredItemAmount(BasicBlankEssence, 1)
    .addPlaceableArea("BarrenIslands")

    .setFormula(new Formula().div(div).add(1).log(12).pow(1.6).add(1))
    .setFormulaX("power")
    .setFormulaXCap(new CurrencyBundle().set("Power", 1e33))

    .trait(Charger)
    .ignoresLimit(true)
    .setRadius(999)
    .applyFormula(
        (v, item) => item.setMul(mul.set("Funds", v).set("Power", v)),
        () => Server.Currency.get("Power"),
    )

    .exit();
