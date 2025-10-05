import Signal from "@antivivi/lemon-signal";
import type APIExposeService from "server/services/APIExposeService";
import type Item from "shared/item/Item";
import type Items from "shared/items/Items";

/** Shared access to server utilities. Initalized by {@link APIExposeService}. */
export const Server = {
    ready: false,
} as Server;

/**
 * A shared map of all items by their unique identifier.
 * Initialized by {@link Items.itemsPerId}. Do not rely on this being populated immediately on script load.
 */
export const ITEM_PER_ID = new Map<string, Item>();

/** Exposed signals that allow the UI to interact outside `src/client`. */
export namespace UISignals {
    export const showCurrencyGain = new Signal<(at: Vector3 | undefined, amountPerCurrency: BaseCurrencyMap) => void>();
}
