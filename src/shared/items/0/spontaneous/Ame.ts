import Difficulty from "@antivivi/jjt-difficulties";
import { OnoeNum } from "@antivivi/serikanum";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Formula from "shared/currency/Formula";
import Item from "shared/item/Item";
import { Server } from "shared/item/ItemUtils";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import FormulaBundled from "shared/item/traits/FormulaBundled";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import CruelBlankEssence from "shared/items/0/spontaneous/CruelBlankEssence";

export = new Item(script.Name)
    .setName("Ame")
    .setDescription(`<font color="rgb(255,0,0)" weight="heavy">The noise of rain.</font>\n`
    )
    .setDifficulty(Difficulty.Spontaneous)
    .setPrice(new CurrencyBundle().set("Purifier Clicks", 1e36), 1)
    .setRequiredItemAmount(CruelBlankEssence, 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")

    .setFormula(new Formula().log(10).div(100).add(1))
    .setFormulaX("skill")
    .setFormulaXCap(new CurrencyBundle().set("Skill", OnoeNum.fromSerika(1, 3306)))

    .trait(Conveyor)
    .setSpeed(3)

    .trait(FormulaBundled)
    .setX(() => Server.Currency.get("Skill"))
    .setRatio("Power", 99.99)
    .setRatio("Bitcoin", 99.99)
    .apply(Upgrader)
    .setSky(true)

    .exit();