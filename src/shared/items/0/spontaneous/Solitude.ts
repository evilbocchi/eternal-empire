import Difficulty from "@antivivi/jjt-difficulties";
import { OnoeNum } from "@antivivi/serikanum";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Formula from "shared/currency/Formula";
import Item from "shared/item/Item";
import { GameUtils } from "shared/item/ItemUtils";
import Conveyor from "shared/item/traits/Conveyor";
import FormulaBundled from "shared/item/traits/special/FormulaBundled";
import Upgrader from "shared/item/traits/Upgrader";
import CruelBlankEssence from "shared/items/0/spontaneous/CruelBlankEssence";

export = new Item(script.Name)
    .setName("Solitude")
    .setDescription(`<font color="rgb(255,0,0)" weight="heavy">An endless solo of nothingness.</font>\n`
    )
    .setDifficulty(Difficulty.Spontaneous)
    .setPrice(new CurrencyBundle().set("Funds", 1e45), 1)
    .setRequiredItemAmount(CruelBlankEssence, 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")

    .setFormula(new Formula().log(10).div(100).add(1))
    .setFormulaX("skill")
    .setFormulaXCap(new CurrencyBundle().set("Skill", OnoeNum.fromSerika(1, 3306)))

    .trait(Conveyor)
    .setSpeed(50)

    .trait(FormulaBundled)
    .setX(() => GameUtils.currencyService.get("Skill"))
    .setRatio("Funds", 9.99)
    .setRatio("Skill", 9.99)
    .apply(Upgrader)
    .setSky(true)

    .exit();