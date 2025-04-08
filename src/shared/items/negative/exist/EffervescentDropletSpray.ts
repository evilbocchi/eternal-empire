import Difficulty from "@antivivi/jjt-difficulties";
import Conveyor from "shared/item/traits/Conveyor";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/Upgrader";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Formula from "shared/currency/Formula";
import { GameUtils } from "shared/item/ItemUtils";

const mul = new CurrencyBundle().set("Funds", 0).set("Power", 0);

export = new Item(script.Name)
    .setName("Effervescent Droplet Spray")
    .setDescription("Rinses droplets to make them sparkling clean! Boost ratio is 3 W : $2, meaning that Funds boost is 2/3 that of Power. Maxes out at %cap%.")
    .setDifficulty(Difficulty.Exist)
    .setPrice(new CurrencyBundle().set("Funds", 504e12), 1)
    .addPlaceableArea("BarrenIslands")

    .setFormula(new Formula().div(20).add(1).log(4).mul(0.3).add(1))
    .setFormulaX("power")
    .setFormulaXCap(new CurrencyBundle().set("Power", 10e12))

    .trait(Upgrader)
    .applyFormula((v, item) => item.setMul(mul.set("Funds", v.mul(0.666)).set("Power", v)), () => GameUtils.currencyService.get("Power"))

    .trait(Conveyor)
    .setSpeed(1)

    .exit();