import Difficulty from "@antivivi/jjt-difficulties";
import { OnoeNum } from "@antivivi/serikanum";
import Generator from "shared/item/Generator";
import Price from "shared/Price";
import Formula from "shared/utils/Formula";
import { GameUtils } from "shared/utils/ItemUtils";

const amt = new OnoeNum(1e12);
const base = new Price().setCost("Power", amt);

export = new Generator(script.Name)
    .setName("Timelost Desert")
    .setDescription("The hands of time are frozen for you, allowing you to produce unparalled amounts of Power. Produces %gain%, this amount increasing with Skill and Total Playtime. Caps at %cap%. And... that's it for the update.")
    .setDifficulty(Difficulty.Vibeness)
    .setPrice(new Price().setCost("Skill", 5000000), 1)
    .addPlaceableArea("BarrenIslands")
    .setCreator("CoPKaDT")

    .setPassiveGain(base)
    .ambienceSound((model) => (model.WaitForChild("Hitbox").WaitForChild("Sound") as Sound))
    .setFormula(new Formula().div(1000).pow(0.1))
    .setFormulaX("(skill * time)")
    .setFormulaXCap(new Price().setCost("Skill", 50e9))
    .applyFormula((v, item) => item.setPassiveGain(base.setCost("Power", amt.mul(v.mul(GameUtils.empireData.playtime)))), () => GameUtils.currencyService.getCost("Skill"));