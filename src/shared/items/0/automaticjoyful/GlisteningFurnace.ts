import Difficulty from "@antivivi/jjt-difficulties";
import Furnace from "shared/item/traits/Furnace";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Formula from "shared/currency/Formula";
import { GameAPI } from "shared/item/ItemUtils";

const mul = new CurrencyBundle();

export = new Item(script.Name)
    .setName("Glistening Furnace")
    .setDescription("The far successor to the Energised Furnace. Was that nostalgic? Boosts Skill with Power, maxes out at %cap%.")
    .setDifficulty(Difficulty.AutomaticJoyful)
    .setPrice(new CurrencyBundle().set("Power", 4e21).set("Skill", 6000), 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .persists("Skillification")

    .setFormula(new Formula().div(1e18).add(10).pow(0.12))
    .setFormulaX("power")
    .setFormulaXCap(new CurrencyBundle().set("Power", 1e27))

    .trait(Furnace)
    .applyFormula((v, item) => item.setMul(mul.set("Skill", v)), () => GameAPI.currencyService.get("Power"))

    .exit();