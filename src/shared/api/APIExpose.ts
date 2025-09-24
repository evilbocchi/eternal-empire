import Signal from "@antivivi/lemon-signal";
import { BaseOnoeNum } from "@antivivi/serikanum";
import type APIExposeService from "server/services/APIExposeService";
import UpgradeBoard from "shared/item/traits/UpgradeBoard";

/** Shared access to server utilities. Initalized by {@link APIExposeService}. */
export const Server = {
    ready: false,
} as Server;

/** Exposed signals that allow the UI to interact outside `src/client`. */
export namespace UISignals {
    export const showCurrencyGain = new Signal<(at: Vector3, amountPerCurrency: BaseCurrencyMap) => void>();
}
