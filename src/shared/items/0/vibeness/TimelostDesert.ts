import Difficulty from "@rbxts/ejt";
import { OnoeNum } from "@rbxts/serikanum";
import { Server } from "shared/api/APIExpose";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Formula from "shared/currency/Formula";
import Item from "shared/item/Item";
import Generator from "shared/item/traits/generator/Generator";
import Class0Shop from "shared/items/0/Class0Shop";

const amt = new OnoeNum(100e12);
const base = new CurrencyBundle().set("Power", amt);

export = new Item(script.Name)
    .setName("Timelost Desert")
    .setDescription(
        "The hands of time are frozen for you, allowing you to produce unparalled amounts of Power. Produces %gain%, this amount increasing with Skill and Total Playtime.",
    )
    .setDifficulty(Difficulty.Vibeness)
    .setPrice(new CurrencyBundle().set("Skill", 4000000), 1)
    .addPlaceableArea("BarrenIslands")
    .soldAt(Class0Shop)
    .setCreator("CoPKaDT")

    .setFormula(new Formula().pow(0.25))
    .setFormulaX("(skill * time)")

    .trait(Generator)
    .setPassiveGain(base)
    .applyFormula(
        (v, item) => {
            return item.setPassiveGain(base.set("Power", amt.mul(v)));
        },
        () => Server.Currency.get("Skill").mul(Server.empireData.playtime),
    )

    .exit();
