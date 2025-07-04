import Difficulty from "@antivivi/jjt-difficulties";
import Conveyor from "shared/item/traits/Conveyor";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/Upgrader";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Formula from "shared/currency/Formula";
import { Server } from "shared/item/ItemUtils";

export = new Item(script.Name)
    .setName("Slamo Upgrader")
    .setDescription("This slamo wants to be a manumatic purifier, but unfortunately it couldn't. It settled to boost Funds and Bitcoin by... Purifier Clicks?")
    .setDifficulty(Difficulty.Happylike)
    .setPrice(new CurrencyBundle().set("Funds", 100e30), 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .setCreator("CoPKaDT")
    .persists("Skillification")

    .setFormula(new Formula().div(1000000).add(10).log(7).pow(2).div(4).add(1))
    .setFormulaX("pclicks")

    .trait(Upgrader)
    .applyFormula((v, item) => item.setMul(new CurrencyBundle().set("Funds", v).set("Bitcoin", v)), () => Server.Currency.get("Purifier Clicks"))

    .trait(Conveyor)
    .setSpeed(8)

    .exit();