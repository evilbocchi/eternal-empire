import { TweenService, Debris, Workspace } from "@rbxts/services";
import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulties from "shared/difficulty/Difficulties";
import Upgrader from "shared/item/Upgrader";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";
import { playSoundAtPart } from "shared/utils/vrldk/BasePartUtils";

export = new Upgrader("AwesomeManumaticPurifier")
.setName("Awesome Manumatic Purifier")
.setDescription("A majestic tower standing through the innumerable trials. Click the structure to increase its Funds boost!")
.setDifficulty(Difficulties.FelixTheA)
.setPrice(new Price().setCost("Funds", new InfiniteMath([208, 12])), 1)
.addPlaceableArea(AREAS.BarrenIslands)

.onLoad((model, utils, item) => {
    const sound = model.FindFirstChildOfClass("Sound");
    if (sound === undefined) {
        return;
    }
    (model.WaitForChild("Laser") as BasePart).Transparency = 0.7;
    const shadow = model.WaitForChild("Shadow") as UnionOperation;
    const billboardGui = model.WaitForChild("GuiPart").WaitForChild("BillboardGui") as BillboardGui;
    const amountLabel = billboardGui.WaitForChild("AmountLabel") as TextLabel;
    const fundsLabel = billboardGui.WaitForChild("FundsLabel") as TextLabel;
    const cpcLabel = billboardGui.WaitForChild("CPCLabel") as TextLabel;
    let cpc = new InfiniteMath(1);
    const update = () => {
        const amount = utils.getBalance().getCost("Purifier Clicks") ?? new InfiniteMath(0);
        amountLabel.Text = "Clicked: " + tostring(new InfiniteMath(amount));
        const fundsBoost = InfiniteMath.log10(amount.div(50).add(1)).pow(1.1).add(1);
        fundsLabel.Text = tostring(fundsBoost) + "x Funds";
        item.setMul(new Price().setCost("Funds", fundsBoost));
        if (amount.lt(100)) {
            cpc = new InfiniteMath(1);
            cpcLabel.Text = "(Click " + (new InfiniteMath(100).sub(amount)) + " more times to unlock this boost!)";
        }
        else {
            cpc = InfiniteMath.log10(amount.sub(90).div(10)).pow(1.1).div(3.5).add(1);
            cpcLabel.Text = tostring(cpc) + "x Purifier Clicks/click";
        }
    }
    item.repeat(model, () => update(), 0.5);
    const click = (delta: InfiniteMath) => {
        playSoundAtPart(model.PrimaryPart, sound);
        task.spawn(() => {
            const clone = shadow.Clone();
            clone.Transparency = 0.5;
            TweenService.Create(clone, tweenInfo, { Transparency: 1, Size: clone.Size.add(new Vector3(1, 1, 1)) }).Play();
            Debris.AddItem(clone, 1);
            clone.Parent = Workspace;
        });
        utils.setBalance(utils.getBalance().add(new Price().setCost("Purifier Clicks", delta)));
        update();
        last = tick();
    }
    update();
    const clickDetector = new Instance("ClickDetector");
    let last = 0;
    const tweenInfo = new TweenInfo(0.2);
    clickDetector.MouseClick.Connect(() => {
        if (tick() - last < 0.1) {
            return;
        }
        click(cpc);
    });
    clickDetector.Parent = model.WaitForChild("ClickArea");
});