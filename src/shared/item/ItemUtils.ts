import { BaseOnoeNum, OnoeNum } from "@antivivi/serikanum";
import { Debris, RunService, TweenService } from "@rbxts/services";
import StringBuilder from "@rbxts/stringbuilder";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { ASSETS } from "shared/GameAssets";
import type Item from "shared/item/Item";
import Packets from "shared/Packets";

declare global {
    interface DropletAssets {
        DropletGui: BillboardGui & {
            Frame: Frame & {
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
    /** Shared access to game utilities. Initalized by server service */
    export const GameUtils = {
        ready: false
    } as GameUtils;

    export const UserGameSettings = RunService.IsClient() ? UserSettings().GetService("UserGameSettings") : undefined;

    export const REPEATS = new Map<(dt: number) => void, { delta?: number, lastCall?: number; }>();
    export const dropletGuiTween = new TweenInfo(1.4, Enum.EasingStyle.Quad, Enum.EasingDirection.Out);

    export const getPlacedItemsInArea = (area: BasePart, Items = GameUtils.items) => {
        const array = area.GetTouchingParts();
        const items = new Map<Model, Item>();
        for (const touching of array) {
            const target = touching.FindFirstAncestorOfClass("Model");
            if (target === undefined) {
                continue;
            }
            const itemId = target.GetAttribute("ItemId") as string;
            if (itemId === undefined) {
                continue;
            }
            const item = Items.getItem(itemId);
            if (item === undefined) {
                error();
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
        }
        else if (amountPerCurrency !== undefined) {
            const builder = new StringBuilder();
            let i = 0;
            for (const [currency, details] of CurrencyBundle.SORTED_DETAILS) {
                const amount = amountPerCurrency.get(currency);
                if (amount === undefined)
                    continue;
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

        dropletGui.StudsOffset = (new Vector3(math.random(-25, 25), math.random(-25, 25), math.random(-25, 25))).mul(0.01);

        const tweenInfo = new TweenInfo(0.85, Enum.EasingStyle.Quart, Enum.EasingDirection.In);
        for (const label of labels) {
            TweenService.Create(label, tweenInfo, { TextTransparency: 1, TextStrokeTransparency: 1 }).Play();
            TweenService.Create(label.UIStroke, tweenInfo, { Transparency: 1 }).Play();
        }
        if (UserGameSettings !== undefined && UserGameSettings.SavedQualityLevel.Value > 5) {
            const transitioningPosition = dropletGui.Frame.Position.add(new UDim2(0, 0, 0, 50));
            TweenService.Create(dropletGui.Frame, tweenInfo, {
                Position: transitioningPosition,
                Rotation: dropletGui.Frame.Rotation + math.random(-45, 45)
            }).Play();
        }

        dropletGui.Enabled = true;
        Debris.AddItem(dropletGui, 3);

        return dropletGui;
    };

    export const applyImpulse = (part: BasePart, impulse: Vector3) => {
        const networkOwner = part.GetNetworkOwner();
        if (networkOwner !== undefined)
            Packets.applyImpulse.fire(networkOwner, part.Name, impulse);
        else
            part.ApplyImpulse(impulse);
    };
}

export = ItemUtils;