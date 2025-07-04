import Difficulty from "@antivivi/jjt-difficulties";
import Furnace from "shared/item/traits/Furnace";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Formula from "shared/currency/Formula";
import { Server } from "shared/item/ItemUtils";
import RoboticCauldron from "shared/items/0/walkthrough/RoboticCauldron";

const mul = new CurrencyBundle().set("Power", 1);

export = new Item(script.Name)
    .setName("Automatic Joyful Furnace")
    .setDescription(`Processes Power at a higher value, boost increasing with Power. Could be better than the ${RoboticCauldron.name} depending on your use case.`)
    .setDifficulty(Difficulty.AutomaticJoyful)
    .setPrice(new CurrencyBundle().set("Purifier Clicks", 1e21), 1)
    .addPlaceableArea("BarrenIslands")

    .setFormula(new Formula().add(1).log(5).mul(32.8).add(5))
    .setFormulaX("power")
    .setFormulaXCap(new CurrencyBundle().set("Power", 10e24))

    .trait(Furnace)
    .applyFormula((v, item) => item.setMul(mul.set("Power", v)), () => Server.Currency.get("Power"))

    .exit();