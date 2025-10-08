import Signal from "@antivivi/lemon-signal";
import type APIExposeService from "server/services/APIExposeService";

/** Shared access to server utilities. Initalized by {@link APIExposeService}. */
export const Server = {
    ready: false,
} as Server;

/** Exposed signals that allow the UI to interact outside `src/client`. */
export namespace UISignals {
    export const showCurrencyGain = new Signal<(at: Vector3 | undefined, amountPerCurrency: BaseCurrencyMap) => void>();
}
