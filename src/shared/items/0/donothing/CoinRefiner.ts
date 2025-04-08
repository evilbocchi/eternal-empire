import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/Upgrader";
import Formula from "shared/currency/Formula";
import { GameUtils } from "shared/item/ItemUtils";

const mul = new CurrencyBundle().set("Bitcoin", 0);

export = new Item(script.Name)
    .setName("Coin Refiner")
    .setDescription("Boosts Bitcoin gain, with that multiplier increasing by Bitcoin.")
    .setDifficulty(Difficulty.DoNothing)
    .setPrice(new CurrencyBundle().set("Funds", 70e24).set("Bitcoin", 360), 1)
    .setPrice(new CurrencyBundle().set("Funds", 620e24).set("Bitcoin", 1200), 2)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .setCreator("CoPKaDT")
    .persists("Skillification")

    .setFormula(new Formula().add(1).pow(0.1).add(1))
    .setFormulaX("bitcoin")

    .trait(Upgrader)
    .applyFormula((v, upgrader) => upgrader.setMul(mul.set("Bitcoin", v)), () => GameUtils.currencyService.get("Bitcoin"))

    .exit();