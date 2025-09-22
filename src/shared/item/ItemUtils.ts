import { BaseOnoeNum, OnoeNum } from "@antivivi/serikanum";
import { Debris, RunService, TweenService } from "@rbxts/services";
import StringBuilder from "@rbxts/stringbuilder";
import { ASSETS } from "shared/asset/GameAssets";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { Server } from "shared/api/APIExpose";
import type Item from "shared/item/Item";
import Packets from "shared/Packets";

declare global {
    interface DropletAssets {
        DropletGui: BillboardGui & {
            Frame: CanvasGroup & {
                ValueLabel: TextLabel & {
                    UIStroke: UIStroke;
                };
            };
        };
    }
}

namespace ItemUtils {
    /** Shared access to id-item object map. Initialized by Items */
    export let itemsPerId: Map<string, Item>;

    export const UserGameSettings = RunService.IsClient() ? UserSettings().GetService("UserGameSettings") : undefined;

    export const REPEATS = new Map<(dt: number) => void, { delta?: number; lastCall?: number }>();
    export const dropletGuiTween = new TweenInfo(1.4, Enum.EasingStyle.Quad, Enum.EasingDirection.Out);

    const placedItemOverlapParams = new OverlapParams();
    placedItemOverlapParams.FilterType = Enum.RaycastFilterType.Include;
    placedItemOverlapParams.CollisionGroup = "ItemHitbox";

    export const getPlacedItemsInArea = (area: BasePart, Items = Server.Items) => {
        const array = area.GetTouchingParts();
        const items = new Map<Model, Item>();
        for (const touching of array) {
            const target = touching.Parent as Model;
            const itemId = target.GetAttribute("ItemId") as string;
            if (itemId === undefined) {
                continue;
            }
            const item = Items.getItem(itemId);
            if (item === undefined) {
                throw `Item with id ${itemId} not found in items map.`;
            }
            items.set(target, item);
        }
        return items;
    };

    export const loadDropletGui = (amountPerCurrency?: Map<Currency, BaseOnoeNum>, overrideText?: string) => {
        const dropletGui = ASSETS.Droplet.DropletGui.Clone();
        const labels = new Array<typeof dropletGui.Frame.ValueLabel>();
        if (overrideText !== undefined) {
            const label = dropletGui.Frame.ValueLabel;
            label.Text = overrideText;
            labels.push(label);
        } else if (amountPerCurrency !== undefined) {
            const builder = new StringBuilder();
            let i = 0;
            for (const [currency, details] of CurrencyBundle.SORTED_DETAILS) {
                const amount = amountPerCurrency.get(currency);
                if (amount === undefined || new OnoeNum(0).equals(amount)) continue;
                if (i > 0) {
                    builder.append("\n");
                }
                const label = dropletGui.Frame.ValueLabel.Clone();
                label.TextColor3 = details.color;
                label.UIStroke.Color = details.color;
                label.Text = CurrencyBundle.getFormatted(currency, new OnoeNum(amount));
                label.Parent = dropletGui.Frame;
                labels.push(label);
                ++i;
            }
            dropletGui.Frame.ValueLabel.Visible = false;
        }

        dropletGui.StudsOffset = new Vector3(math.random(-25, 25), math.random(-25, 25), math.random(-25, 25)).mul(
            0.01,
        );

        const tweenInfo = new TweenInfo(0.85, Enum.EasingStyle.Quart, Enum.EasingDirection.In);
        TweenService.Create(dropletGui.Frame, tweenInfo, {
            GroupTransparency: 1,
            Position: dropletGui.Frame.Position.add(new UDim2(0, 0, 0, 50)),
            Rotation: dropletGui.Frame.Rotation + math.random(-45, 45),
        }).Play();

        dropletGui.Enabled = true;
        Debris.AddItem(dropletGui, 3);

        return dropletGui;
    };

    export let showCurrencyGain: ((at: Vector3, amountPerCurrency: Map<Currency, BaseOnoeNum>) => void) | undefined =
        undefined;

    export const applyImpulse = (part: BasePart, impulse: Vector3) => {
        const networkOwner = part.GetNetworkOwner();
        if (networkOwner !== undefined) Packets.applyImpulse.toClient(networkOwner, part.Name, impulse);
        else part.ApplyImpulse(impulse);
    };
}

export = ItemUtils;
