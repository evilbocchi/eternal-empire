import { BaseOnoeNum, OnoeNum } from "@antivivi/serikanum";
import { Debris, TweenService } from "@rbxts/services";
import StringBuilder from "@rbxts/stringbuilder";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { ASSETS } from "shared/GameAssets";
import type Item from "shared/item/Item";

declare global {
    interface DropletAssets {
        DropletGui: BillboardGui & {
            ValueLabel: TextLabel;
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

    export const loadDropletGui = (host?: PVInstance | Attachment, amountPerCurrency?: Map<Currency, BaseOnoeNum>, overrideText?: string, sizeMulti?: number) => {
        const dropletGui = ASSETS.Droplet.DropletGui.Clone();
        const labels = new Array<TextLabel>();
        if (overrideText !== undefined) {
            const label = dropletGui.ValueLabel;
            if (sizeMulti !== undefined)
                label.Size = new UDim2(1, 0, 0.125 * sizeMulti, 0);
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
                const label = dropletGui.ValueLabel.Clone();
                label.TextColor3 = details.color ?? Color3.fromRGB(255, 255, 255);
                label.Text = CurrencyBundle.getFormatted(currency, new OnoeNum(amount));
                label.Parent = dropletGui;
                labels.push(label);
                ++i;
            }
            dropletGui.ValueLabel.Visible = false;
            //dropletGui.ValueLabel.Size = new UDim2(1, 0, 0.125 * i, 0);
            //dropletGui.ValueLabel.Text = builder.toString();
        }

        dropletGui.StudsOffset = (new Vector3(math.random(-25, 25), math.random(-25, 25), math.random(-25, 25))).mul(0.01);
        for (const label of labels)
            task.delay(1, () => TweenService.Create(label, new TweenInfo(0.4), { TextTransparency: 1, TextStrokeTransparency: 1 }).Play());
        TweenService.Create(dropletGui, dropletGuiTween, { StudsOffset: dropletGui.StudsOffset.add(new Vector3(0, 0.6, 0)) }).Play();
        dropletGui.Adornee = host;
        dropletGui.Enabled = true;
        dropletGui.Parent = host;
        Debris.AddItem(dropletGui, 3);

        return dropletGui;
    };
}

export = ItemUtils;