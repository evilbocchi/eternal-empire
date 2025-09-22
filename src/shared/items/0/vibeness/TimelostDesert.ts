import Difficulty from "@antivivi/jjt-difficulties";
import { OnoeNum } from "@antivivi/serikanum";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Formula from "shared/currency/Formula";
import ThisEmpire from "shared/data/ThisEmpire";
import Item from "shared/item/Item";
import { Server } from "shared/api/APIExpose";
import Generator from "shared/item/traits/generator/Generator";

const amt = new OnoeNum(100e12);
const base = new CurrencyBundle().set("Power", amt);

export = new Item(script.Name)
    .setName("Timelost Desert")
    .setDescription(
        "The hands of time are frozen for you, allowing you to produce unparalled amounts of Power. Produces %gain%, this amount increasing with Skill and Total Playtime.",
    )
    .setDifficulty(Difficulty.Vibeness)
    .setPrice(new CurrencyBundle().set("Skill", 2000000), 1)
    .addPlaceableArea("BarrenIslands")
    .setCreator("CoPKaDT")

    .setFormula(new Formula().pow(0.25))
    .setFormulaX("(skill * time)")

    .trait(Generator)
    .setPassiveGain(base)
    .applyFormula(
        (v, item) => {
            return item.setPassiveGain(base.set("Power", amt.mul(v)));
        },
        () => Server.Currency.get("Skill").mul(ThisEmpire.data.playtime),
    )

    .exit();
