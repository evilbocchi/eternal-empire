import PartCacheModule from "@rbxts/partcache";
import { TweenService, Workspace } from "@rbxts/services";
import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import { AREAS } from "shared/constants";
import { Manumatic } from "shared/item/Special";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";
import { playSoundAtPart } from "shared/utils/vrldk/BasePartUtils";

export = new Manumatic.ManumaticUpgrader("AwesomeManumaticPurifier")
.setName("Awesome Manumatic Purifier")
.setDescription("A majestic tower standing through the innumerable trials. Click the structure to increase its Funds boost!")
.setDifficulty(Difficulty.FelixTheA)
.setPrice(new Price().setCost("Funds", new InfiniteMath([158, 12])), 1)
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
        const fundsBoost = InfiniteMath.log(amount.div(50).add(1), 8).pow(1.1).add(1);
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
    const tweenInfo = new TweenInfo(0.2);

    const partCache = new PartCacheModule(shadow, 25);

    const shadowSize = shadow.Size;
    const newSize = shadowSize.add(new Vector3(1, 1, 1));
    // Fortunately this is a singleton
    item.setOnClick((model, utils, _item, player, value) => {
        playSoundAtPart(model.PrimaryPart, sound);
        task.spawn(() => {
            const clone = partCache.GetPart();
            clone.Position = shadow.Position;
            clone.Size = shadowSize;
            clone.Transparency = 0.5;
            TweenService.Create(clone, tweenInfo, { Transparency: 1, Size: newSize }).Play();
            clone.Parent = Workspace;
            task.wait(1);
            partCache.ReturnPart(clone);
        });
        if (player !== undefined) {
            player.SetAttribute("RawPurifierClicks", (player.GetAttribute("RawPurifierClicks") as number ?? 0) + 1);
        }
        utils.setBalance(utils.getBalance().add(new Price().setCost("Purifier Clicks", cpc.mul(value))));
        update();
    });
    item.repeat(model, () => update(), 0.5);
    update();
});