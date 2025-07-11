import Signal from "@antivivi/lemon-signal";
import { OnoeNum } from "@antivivi/serikanum";
import type Item from "shared/item/Item";


namespace ItemUtils {
    /** Shared access to id-item object map. Initialized by Items */
    export let itemsPerId: Map<string, Item>;
    /** Shared access to game utilities. Initalized by server service */
    export const GameUtils = {
        ready: false
    } as GameUtils;

    export const formulaResultsChanged = new Signal<(resultPerItem: Map<string, OnoeNum>) => void>();
    export const REPEATS = new Map<(dt: number) => void, { delta?: number, lastCall?: number; }>();

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
    }

    export let clientDroplets = false;
}

export = ItemUtils;