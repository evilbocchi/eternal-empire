import Difficulty from "@antivivi/jjt-difficulties";
import { OnoeNum } from "@antivivi/serikanum";
import { Streaming } from "@antivivi/vrldk";
import PartCacheModule from "@rbxts/partcache";
import { PartCache } from "@rbxts/partcache/out/class";
import { TweenService, Workspace } from "@rbxts/services";
import { Server, UISignals } from "shared/api/APIExpose";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Clickable from "shared/item/traits/action/Clickable";
import Manumatic from "shared/item/traits/action/Manumatic";
import Operative from "shared/item/traits/Operative";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";

export = new Item(script.Name)
    .setName("Awesome Manumatic Purifier")
    .setDescription(
        "A majestic tower standing through the innumerable trials. Applies a Funds boost to raised droplets passing through it. Click the structure to increase the boost!",
    )
    .setDifficulty(Difficulty.FelixTheA)
    .setPrice(new CurrencyBundle().set("Funds", OnoeNum.fromSerika(158, 12)), 1)
    .addPlaceableArea("BarrenIslands")

    .trait(Manumatic)
    .trait(Upgrader)
    .exit()

    .onLoad((model, item) => {
        const upgrader = item.trait(Upgrader);
        const clickable = item.trait(Clickable);

        (model.WaitForChild("Laser") as BasePart).Transparency = 0.7;
        const billboardGui = model.WaitForChild("GuiPart").WaitForChild("BillboardGui") as BillboardGui;
        const amountLabel = billboardGui.WaitForChild("AmountLabel") as TextLabel;
        const fundsLabel = billboardGui.WaitForChild("FundsLabel") as TextLabel;
        const cpcLabel = billboardGui.WaitForChild("CPCLabel") as TextLabel;
        let cpc = new OnoeNum(1);
        const CurrencyService = Server.Currency;
        const RevenueService = Server.Revenue;
        const PURIFIER_UPGRADES = NamedUpgrades.getUpgrades("Purifier");

        const update = () => {
            const amount = CurrencyService.get("Purifier Clicks");
            amountLabel.Text = "Clicked: " + tostring(OnoeNum.round(amount));
            const fundsBoost = OnoeNum.log(amount.div(50).add(1), 8)?.pow(2).div(2).add(1);
            fundsLabel.Text = `x${tostring(fundsBoost)} Funds`;
            upgrader.setMul(new CurrencyBundle().set("Funds", fundsBoost));

            const purifierBoostReq = new OnoeNum(100);
            if (amount.lessThan(purifierBoostReq)) {
                cpc = new OnoeNum(1);
                cpcLabel.Text = "(Click " + purifierBoostReq.sub(amount).round() + " more times to unlock this boost!)";
            } else {
                cpc = OnoeNum.log10(amount.sub(90).div(10))?.pow(2).div(6).add(1) ?? new OnoeNum(1);
                cpcLabel.Text = tostring(cpc) + "x Purifier Clicks/click";
            }
        };
        const fireClickedRemote = Streaming.createStreamableRemote(model, true);

        // Fortunately this is a singleton
        clickable.setOnClick((_model, _item, player, value) => {
            if (player !== undefined) {
                player.SetAttribute(
                    "RawPurifierClicks",
                    ((player.GetAttribute("RawPurifierClicks") as number) ?? 0) + 1,
                );
            }
            let [totalAdd, totalMul, totalPow] = Operative.template();
            [totalAdd, totalMul, totalPow] = RevenueService.applyGlobal(
                totalAdd,
                totalMul,
                totalPow,
                PURIFIER_UPGRADES,
            );
            const valuePrice = new CurrencyBundle().set("Purifier Clicks", cpc.mul(value));
            const worth = Operative.coalesce(valuePrice, totalAdd, totalMul, totalPow);
            const final = RevenueService.performSoftcaps(worth.amountPerCurrency);
            CurrencyService.incrementAll(final);
            fireClickedRemote(final);
            update();
        });
        item.repeat(model, () => update(), 0.5);
        update();
    })
    .onClientLoad((model) => {
        const tweenInfo = new TweenInfo(0.2);
        let shadow: BasePart | undefined;
        let partCache: PartCache;
        let shadowSize: Vector3;
        let newSize: Vector3;

        Streaming.onStreamableRemote(model, (amountPerCurrency) => {
            UISignals.showCurrencyGain.fire(model.PrimaryPart!.Position, amountPerCurrency);
            model.PrimaryPart!.FindFirstChildOfClass("Sound")?.Play();

            if (shadow === undefined) {
                shadow = model.FindFirstChild("Shadow") as BasePart | undefined;
                if (shadow === undefined) {
                    return;
                }
                partCache = new PartCacheModule(shadow, 25);
                shadowSize = shadow.Size;
                newSize = shadowSize.add(new Vector3(1, 1, 1));
            }

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
