import Difficulty from "@antivivi/jjt-difficulties";
import { OnoeNum } from "@antivivi/serikanum";
import { RunService } from "@rbxts/services";
import Price from "shared/Price";
import { PowerHarvester } from "shared/item/Special";
import Upgrader from "shared/item/Upgrader";
import Formula from "shared/utils/Formula";
import { GameUtils } from "shared/utils/ItemUtils";
import BasicBlankEssence from "./BasicBlankEssence";

const div = OnoeNum.fromSerika(5, 12);
const mul = new Price().setCost("Funds", 0).setCost("Power", 0);

export = new Upgrader(script.Name)
    .setName("Admiration")
    .setDescription("A gentle stream enchanting the air, taking the stage with a serene retreat... An upgrader boosting Funds and Power with Power, maxing out at %cap%.")
    .setDifficulty(Difficulty.InstantWin)
    .setPrice(new Price().setCost("Funds", 1e21), 1)
    .setRequiredItemAmount(BasicBlankEssence, 1)
    .addPlaceableArea("BarrenIslands")

    .setFormula(new Formula().div(div).add(1).log(12).pow(1.6).add(1))
    .setFormulaX("power")
    .setFormulaXCap(new Price().setCost("Power", 1e33))
    .applyFormula((v, item) => item.setMul(mul.setCost("Funds", v).setCost("Power", v)), () => GameUtils.currencyService.getCost("Power"))
    .onClientLoad((model) => {
        PowerHarvester.spin(model);
        const spin1 = model.WaitForChild("Spin1") as BasePart;
        const spin2 = model.WaitForChild("Spin2") as BasePart;
        const delta = math.rad(120);
        const connection = RunService.Heartbeat.Connect((dt) => {
            spin1.CFrame = spin1.CFrame.mul(CFrame.Angles(0, delta * dt, 0));
            spin2.CFrame = spin2.CFrame.mul(CFrame.Angles(0, -delta * dt, 0));
        });
        model.Destroying.Connect(() => connection.Disconnect());
    });