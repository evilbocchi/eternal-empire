import Difficulty from "@antivivi/jjt-difficulties";
import Furnace from "shared/item/traits/Furnace";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Formula from "shared/currency/Formula";
import { GameUtils } from "shared/item/ItemUtils";

const mul = new CurrencyBundle().set("Funds", 0);

export = new Item(script.Name)
    .setName("Robotic Cauldron")
    .setDescription("When Move-Your-Droplets™ tried branching out from producing conveyors, they experimented with all sorts of different machinery. Their final creation before going back to their ways was this abomination of a cauldron on legs. Boost ratio is 1 W : $1200. Scales with Power, maxing out at %cap%.")
    .setDifficulty(Difficulty.Walkthrough)
    .setPrice(new CurrencyBundle().set("Funds", 600e33).set("Power", 6e18), 1)
    .addPlaceableArea("BarrenIslands")

    .setFormula(new Formula().add(1).log(5).mul(840).add(500))
    .setFormulaX("power")
    .setFormulaXCap(new CurrencyBundle().set("Power", 10e24))

    .trait(Furnace)
    .acceptsUpgrades(false)
    .applyFormula((v, item) => item.setMul(mul.set("Power", v).set("Funds", v.mul(1200))), () => GameUtils.currencyService.get("Power"))

    .exit();