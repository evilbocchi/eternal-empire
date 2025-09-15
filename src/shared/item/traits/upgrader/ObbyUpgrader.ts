import { OnoeNum } from "@antivivi/serikanum";
import { Debris } from "@rbxts/services";
import { getSound } from "shared/asset/GameAssets";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Formula from "shared/currency/Formula";
import Item from "shared/item/Item";
import { Server } from "shared/item/ItemUtils";
import ItemTrait from "shared/item/traits/ItemTrait";
import UpgradeBoard from "shared/item/traits/UpgradeBoard";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import NamedUpgrade from "shared/namedupgrade/NamedUpgrade";

export default class ObbyUpgrader extends ItemTrait {
    static init(obbyUpgrader: ObbyUpgrader) {
        const item = obbyUpgrader.item;
        const upgrader = item.trait(Upgrader);

        item.repeat(
            undefined,
            () => {
                const mul = new CurrencyBundle();
                for (const [upgrade, { currency, formula }] of obbyUpgrader.boosts) {
                    const amount = Server.NamedUpgrade.getUpgradeAmount(upgrade.id);
                    mul.set(currency, formula.evaluate(new OnoeNum(amount)));
                }
                upgrader.setMul(mul);
            },
            1,
        );
    }

    static load(model: Model, obbyUpgrader: ObbyUpgrader) {
        const item = obbyUpgrader.item;
        const obbyPointsGuiPart = model.WaitForChild("ObbyPointsGuiPart") as BasePart;
        const label = obbyPointsGuiPart.FindFirstChildOfClass("SurfaceGui")?.FindFirstChild("TextLabel") as
            | TextLabel
            | undefined;
        if (label === undefined) throw "ObbyPointsGuiPart does not have a TextLabel in its SurfaceGui";
        item.repeat(
            model,
            () => {
                label.Text = `OBBY POINTS: ${Server.Currency.get("Obby Points").toString()}`;
            },
            1,
        );

        for (const part of model.GetChildren()) {
            if (!part.IsA("BasePart")) continue;
            switch (part.Name) {
                case "ObbyZone":
                case "ReturnPart":
                    part.Transparency = 1;
                    part.CanTouch = true;
                    part.CanCollide = false;
                    break;
                case "WinPart":
                    part.CanTouch = true;
                    part.CanCollide = false;
                    break;
                default:
                    break;
            }
        }
        const winPart = model.WaitForChild("WinPart") as BasePart;
        const returnPart = model.WaitForChild("ReturnPart") as BasePart;
        let debounce = false;
        winPart.Touched.Connect((hit) => {
            if (debounce) return;
            const parent = hit.Parent;
            if (parent === undefined || !parent.IsA("Model")) return;
            parent.PivotTo(returnPart.CFrame);
            const reward = obbyUpgrader.reward;
            Server.Currency.increment("Obby Points", reward);
            const color = item.difficulty.color ?? new Color3(1, 1, 1);
            const r = color.R * 255;
            const g = color.G * 255;
            const b = color.B * 255;
            Server.ChatHook.sendServerMessage(
                `${parent.Name} has completed the ${item.name} and earned ${reward.toString()} Obby Points!`,
                `tag:hidden;color:${r},${g},${b}`,
            );
            const sound = getSound("ObbyPointGet.mp3");
            sound.Play();
            sound.Parent = parent;
            Debris.AddItem(sound, 5);

            print(item.name, "completed");
            debounce = true;
            task.delay(1, () => {
                debounce = false;
            });
        });
    }

    readonly boosts = new Map<
        NamedUpgrade,
        {
            currency: Currency;
            formula: Formula;
        }
    >();

    reward = new OnoeNum(0);

    constructor(item: Item) {
        super(item);
        item.trait(Upgrader);
        item.onInit(() => ObbyUpgrader.init(this));
        item.onLoad((model) => ObbyUpgrader.load(model, this));
    }

    setBoost(upgrade: NamedUpgrade, currency: Currency, formula: Formula) {
        this.trait(UpgradeBoard).addUpgrade(upgrade);
        this.boosts.set(upgrade, { currency, formula });
        return this;
    }

    setReward(reward: OnoeNum | number) {
        this.reward = new OnoeNum(reward);
        return this;
    }
}
