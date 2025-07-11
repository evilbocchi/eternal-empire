import { RunService } from "@rbxts/services";
import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import { AREAS } from "shared/constants";
import { PowerHarvester } from "shared/item/Special";
import Upgrader from "shared/item/Upgrader";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";
import BasicBlankEssence from "./BasicBlankEssence";

const div = new InfiniteMath([5, 12]);
const limit = new InfiniteMath([1, 33]);

export = new Upgrader("Admiration")
.setName("Admiration")
.setDescription("A gentle stream enchanting the air, taking the stage with a serene retreat... An upgrader boosting Funds and Power with Power, maxing out at 1De W. <log25(power / 5T + 1) + 1>")
.setDifficulty(Difficulty.InstantWin)
.setPrice(new Price().setCost("Funds", new InfiniteMath([1, 21])), 1)
.setRequiredItemAmount(BasicBlankEssence, 1)
.addPlaceableArea(AREAS.BarrenIslands)

.onInit((utils, item) => item.applyFormula((v) => item.setMul(v), () => {
    const cost = new InfiniteMath(utils.getBalance().getCost("Power") ?? 0);
    if (limit.lt(cost)) {
        return limit;
    }
    return cost;
}, 
(x) => {
    const y = InfiniteMath.log(x.div(div).add(1), 25).add(1);
    return new Price().setCost("Funds", y).setCost("Power", y);
}))
.onLoad((model) => {
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