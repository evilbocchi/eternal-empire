import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import AdvancedBlankEssence from "shared/items/0/ifinitude/AdvancedBlankEssence";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Formula from "shared/currency/Formula";
import { Server } from "shared/api/APIExpose";
import Class0Shop from "shared/items/0/Class0Shop";

const mul = new CurrencyBundle();

export = new Item(script.Name)
    .setName("Chromatic Maze")
    .setDescription(
        "Boosts Funds and Power gain by Bitcoin! Pass droplets through each ring with an elevated conveyor to compound the boost. Though, this is easier said than done...",
    )
    .setDifficulty(Difficulty.Ifinitude)
    .setPrice(new CurrencyBundle().set("Bitcoin", 1e6).set("Skill", 15), 1)
    .setRequiredItemAmount(AdvancedBlankEssence, 1)
    .addPlaceableArea("BarrenIslands")
    .soldAt(Class0Shop)

    .setFormula(new Formula().pow(0.01))
    .setFormulaX("bitcoin")

    .trait(Upgrader)
    .applyFormula(
        (v, item) => item.setMul(mul.set("Funds", v).set("Power", v)),
        () => Server.Currency.get("Bitcoin"),
    )

    .exit();
