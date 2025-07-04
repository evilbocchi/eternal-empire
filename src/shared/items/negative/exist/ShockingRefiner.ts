import Difficulty from "@antivivi/jjt-difficulties";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/Upgrader";
import EnergisedRefiner from "shared/items/negative/friendliness/EnergisedRefiner";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Formula from "shared/currency/Formula";
import { ServerAPI } from "shared/item/ItemUtils";

const mul = new CurrencyBundle().set("Funds", 0);

export = new Item(script.Name)
    .setName("Shocking Refiner")
    .setDescription("Gives droplets a bigger shock than an Energised Refiner. Funds boost increases with Power, maxing out at %cap%. Uses %drain%.")
    .setDifficulty(Difficulty.Exist)
    .setPrice(new CurrencyBundle().set("Funds", 16.25e15).set("Power", 1760000), 1)
    .setPrice(new CurrencyBundle().set("Funds", 24.6e15).set("Power", 3240000), 2)
    .setRequiredItemAmount(EnergisedRefiner, 1)
    .addPlaceableArea("BarrenIslands")

    .setFormula(new Formula().mul(2).add(1).log(3).add(1))
    .setFormulaX("power")
    .setFormulaXCap(new CurrencyBundle().set("Power", 4e12))

    .setDrain(new CurrencyBundle().set("Power", 2000))

    .trait(Upgrader)
    .applyFormula((v, item) => item.setMul(mul.set("Funds", v)), () => ServerAPI.currencyService.get("Power"))

    .exit();