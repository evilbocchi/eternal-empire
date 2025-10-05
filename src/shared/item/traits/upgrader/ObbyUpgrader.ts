import { OnoeNum } from "@antivivi/serikanum";
import { simpleInterval } from "@antivivi/vrldk";
import { packet } from "@rbxts/fletchette";
import { Debris, Players } from "@rbxts/services";
import { ITEM_PER_ID, Server } from "shared/api/APIExpose";
import { getSound } from "shared/asset/GameAssets";
import { IS_EDIT, IS_SERVER } from "shared/Context";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Formula from "shared/currency/Formula";
import eat from "shared/hamster/eat";
import Item from "shared/item/Item";
import ItemTrait from "shared/item/traits/ItemTrait";
import UpgradeBoard from "shared/item/traits/UpgradeBoard";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import NamedUpgrade from "shared/namedupgrade/NamedUpgrade";
import Packets from "shared/Packets";

const obbyCompletedPacket = packet<(itemId: string, placementId: string) => void>();

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

    static onClientLoad(model: Model, obbyUpgrader: ObbyUpgrader) {
        const obbyPointsGuiPart = model.WaitForChild("ObbyPointsGuiPart") as BasePart;
        const label = obbyPointsGuiPart.FindFirstChildOfClass("SurfaceGui")?.FindFirstChild("TextLabel") as
            | TextLabel
            | undefined;
        if (label === undefined) throw "ObbyPointsGuiPart does not have a TextLabel in its SurfaceGui";
        const cleanup = simpleInterval(() => {
            label.Text = `OBBY POINTS: ${new OnoeNum(Packets.balance.get().get("Obby Points") ?? 0).toString()}`;
        }, 1);
        model.Destroying.Once(cleanup);

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
        winPart.Touched.Connect((hit) => {
            const parent = hit.Parent;
            if (parent === undefined || !parent.IsA("Model")) return;
            if (Players.GetPlayerFromCharacter(parent) !== Players.LocalPlayer) return;
            obbyCompletedPacket.toServer(obbyUpgrader.item.id, model.Name);
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
        item.onClientLoad((model) => ObbyUpgrader.onClientLoad(model, this));
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

    static {
        if (IS_SERVER || IS_EDIT) {
            let debounce = false;
            const connection = obbyCompletedPacket.fromClient((player, itemId, placementId) => {
                if (debounce) return;
                const item = ITEM_PER_ID.get(itemId);
                if (item === undefined) return;
                const obbyUpgrader = item.trait(ObbyUpgrader);
                if (obbyUpgrader === undefined) return;

                const reward = obbyUpgrader.reward;
                Server.Currency.increment("Obby Points", reward);
                const color = item.difficulty.color ?? new Color3(1, 1, 1);
                const r = color.R * 255;
                const g = color.G * 255;
                const b = color.B * 255;
                Server.ChatHook.sendServerMessage(
                    `${player.Name} has completed the ${item.name} and earned ${reward.toString()} Obby Points!`,
                    `tag:hidden;color:${r},${g},${b}`,
                );
                const sound = getSound("ObbyPointGet.mp3");
                sound.Play();
                sound.Parent = player.Character;
                Debris.AddItem(sound, 5);
                const model = Server.Item.modelPerPlacementId.get(placementId);
                if (model === undefined) return;
                const returnPart = model.WaitForChild("ReturnPart") as BasePart;
                player.Character?.PivotTo(returnPart.CFrame);
                print(item.name, "completed");
                debounce = true;
                task.delay(1, () => {
                    debounce = false;
                });
            });
            eat(connection, "Disconnect");
        }
    }
}
