import Difficulty from "@antivivi/jjt-difficulties";
import { OnoeNum } from "@antivivi/serikanum";
import { TweenService, Workspace } from "@rbxts/services";
import Price from "shared/Price";
import { Manumatic } from "shared/item/Special";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";
import { GameUtils } from "shared/utils/ItemUtils";
import PartCacheModule from "shared/utils/partcache";

export = new Manumatic.ManumaticUpgrader("AwesomeManumaticPurifier")
    .setName("Awesome Manumatic Purifier")
    .setDescription("A majestic tower standing through the innumerable trials. Applies a Funds boost to raised droplets. Click the structure to increase it!")
    .setDifficulty(Difficulty.FelixTheA)
    .setPrice(new Price().setCost("Funds", OnoeNum.fromSerika(158, 12)), 1)
    .addPlaceableArea("BarrenIslands")

    .onLoad((model, item) => {
        (model.WaitForChild("Laser") as BasePart).Transparency = 0.7;
        const billboardGui = model.WaitForChild("GuiPart").WaitForChild("BillboardGui") as BillboardGui;
        const amountLabel = billboardGui.WaitForChild("AmountLabel") as TextLabel;
        const fundsLabel = billboardGui.WaitForChild("FundsLabel") as TextLabel;
        const cpcLabel = billboardGui.WaitForChild("CPCLabel") as TextLabel;
        let cpc = new OnoeNum(1);
        const CurrencyService = GameUtils.currencyService;
        const RevenueService = GameUtils.revenueService;
        const PURIFIER_UPGRADES = NamedUpgrades.getUpgrades("Purifier");
        const update = () => {
            const amount = CurrencyService.getCost("Purifier Clicks");
            amountLabel.Text = "Clicked: " + tostring(new OnoeNum(amount));
            const fundsBoost = OnoeNum.log(amount.div(50).add(1), 8)?.pow(2).div(2).add(1);
            fundsLabel.Text = tostring(fundsBoost) + "x Funds";
            item.setMul(new Price().setCost("Funds", fundsBoost));
            if (amount.lessThan(100)) {
                cpc = new OnoeNum(1);
                cpcLabel.Text = "(Click " + (new OnoeNum(100).sub(amount)) + " more times to unlock this boost!)";
            }
            else {
                cpc = OnoeNum.log10(amount.sub(90).div(10))?.pow(2).div(6).add(1) ?? new OnoeNum(1);
                cpcLabel.Text = tostring(cpc) + "x Purifier Clicks/click";
            }
        };
        const clickedEvent = new Instance("UnreliableRemoteEvent");
        clickedEvent.Name = "ClickedEvent";
        clickedEvent.Parent = model;

        // Fortunately this is a singleton
        item.setOnClick((_model, _item, player, value) => {
            clickedEvent.FireAllClients();
            if (player !== undefined) {
                player.SetAttribute("RawPurifierClicks", (player.GetAttribute("RawPurifierClicks") as number ?? 0) + 1);
            }
            let totalAdd = Price.EMPTY_PRICE;
            let totalMul = Price.ONES;
            let totalPow = Price.ONES;
            [totalAdd, totalMul, totalPow] = RevenueService.applyGlobal(totalAdd, totalMul, totalPow, PURIFIER_UPGRADES);
            const valuePrice = new Price().setCost("Purifier Clicks", cpc.mul(value));
            const worth = RevenueService.coalesce(valuePrice, totalAdd, totalMul, totalPow);
            CurrencyService.incrementCurrencies(RevenueService.applySoftcaps(worth.costPerCurrency));
            update();
        });
        item.repeat(model, () => update(), 0.5);
        update();
    })
    .onClientLoad((model) => {
        const tweenInfo = new TweenInfo(0.2);
        const clickedEvent = model.WaitForChild("ClickedEvent") as UnreliableRemoteEvent;
        const shadow = model.WaitForChild("Shadow") as UnionOperation;
        const partCache = new PartCacheModule(shadow, 25);
        const shadowSize = shadow.Size;
        const newSize = shadowSize.add(new Vector3(1, 1, 1));

        const sound = model.PrimaryPart!.FindFirstChildOfClass("Sound");
        if (sound === undefined) {
            return;
        }
        clickedEvent.OnClientEvent.Connect(() => {
            sound.Play();
            const clone = partCache.GetPart();
            clone.Position = shadow.Position;
            clone.Size = shadowSize;
            clone.Transparency = 0.5;
            TweenService.Create(clone, tweenInfo, { Transparency: 1, Size: newSize }).Play();
            clone.Parent = Workspace;
            task.wait(1);
            partCache.ReturnPart(clone);
        });
    });