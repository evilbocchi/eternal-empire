import Difficulty from "@rbxts/ejt";
import { OnoeNum } from "@antivivi/serikanum";
import { Server } from "shared/api/APIExpose";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Formula from "shared/currency/Formula";
import Item from "shared/item/Item";
import Generator from "shared/item/traits/generator/Generator";

const amt = new OnoeNum(100e12);
const base = new CurrencyBundle().set("Skill", amt);

export = new Item(script.Name)
    .setName("True Skill Generator")
    .setDescription(
        "A legendary generator that harnesses the essence of victory to produce boundless skill points, growing stronger with every triumph.",
    )
    .setDifficulty(Difficulty.Remorseless)
    .setPrice(new CurrencyBundle().set("Wins", 2e12), 1)
    .addPlaceableArea("BarrenIslands")
    .setCreator("CoPKaDT")

    .setFormula(new Formula().sqrt())
    .setFormulaX("wins")

    .trait(Generator)
    .setPassiveGain(base)
    .applyFormula(
        (v, item) => {
            return item.setPassiveGain(base.set("Skill", amt.mul(v)));
        },
        () => Server.Currency.get("Wins"),
    )

    .exit();
