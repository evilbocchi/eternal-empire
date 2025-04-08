import Difficulty from "@antivivi/jjt-difficulties";
import Furnace from "shared/item/traits/Furnace";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Formula from "shared/currency/Formula";
import { GameUtils } from "shared/item/ItemUtils";

const mul = new CurrencyBundle().set("Funds", 0).set("Power", 0);

export = new Item(script.Name)
    .setName("Advanced Power Harvester")
    .setDescription("A relaxing harvester... Boost ratio is 1 W : $400, where Funds will be boosted x400 more. Maxes out at %cap%.")
    .setDifficulty(Difficulty.Relax)
    .setPrice(new CurrencyBundle().set("Power", 812e6).set("Purifier Clicks", 400), 1)
    .addPlaceableArea("BarrenIslands")

    .setFormula(new Formula().add(1).log(5).mul(0.9).add(1))
    .setFormulaX("power")
    .setFormulaXCap(new CurrencyBundle().set("Power", 50e12))

    .trait(Furnace)
    .applyFormula((v, item) => item.setMul(mul.set("Funds", v.mul(400)).set("Power", v)), () => GameUtils.currencyService.get("Power"))

    .exit();