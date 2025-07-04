import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Furnace from "shared/item/traits/Furnace";
import Item from "shared/item/Item";
import Formula from "shared/currency/Formula";
import { ServerAPI } from "shared/item/ItemUtils";

const mul = new CurrencyBundle().set("Funds", 0);

export = new Item(script.Name)
    .setName("Energised Furnace")
    .setDescription("Same thing as Energised Refiner, with Funds boost increasing with Power at a slightly weaker scale, maxing out at %cap%. Uses %drain%.")
    .setDifficulty(Difficulty.Friendliness)
    .setPrice(new CurrencyBundle().set("Power", 75), 1)
    .addPlaceableArea("BarrenIslands")

    .setFormula(new Formula().add(1).log(4).mul(100).add(250))
    .setFormulaX("power")
    .setFormulaXCap(new CurrencyBundle().set("Power", 25000))
    .setDrain(new CurrencyBundle().set("Power", 0.5))

    .trait(Furnace)
    .applyFormula((v, item) => item.setMul(mul.set("Funds", v)), () => ServerAPI.currencyService.get("Power"))
    .exit();