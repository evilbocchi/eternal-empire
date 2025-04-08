import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/Upgrader";
import Formula from "shared/currency/Formula";
import { GameUtils } from "shared/item/ItemUtils";

const mul = new CurrencyBundle().set("Funds", 0);

export = new Item(script.Name)
    .setName("Energised Refiner")
    .setDescription("Power your items up. This upgrader has a Funds boost that increases with the amount of Power you own, maxing out when you reach %cap%. Uses %drain%.")
    .setDifficulty(Difficulty.Friendliness)
    .setPrice(new CurrencyBundle().set("Power", 20), 1)
    .setPrice(new CurrencyBundle().set("Power", 120), 2)
    .addPlaceableArea("BarrenIslands")

    .setFormula(new Formula().add(1).log(3).add(1))
    .setFormulaX("power")
    .setFormulaXCap(new CurrencyBundle().set("Power", 5000))

    .setDrain(new CurrencyBundle().set("Power", 0.4))

    .trait(Upgrader)
    .applyFormula((v, item) => item.setMul(mul.set("Funds", v)), () => GameUtils.currencyService.get("Power"))
    .exit();
