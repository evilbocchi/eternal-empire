import { OnoeNum } from "@antivivi/serikanum";
import { Workspace } from "@rbxts/services";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Packets from "shared/Packets";

export default function displayBalanceCurrency(currency: Currency, amount: OnoeNum): string {
    const camera = Workspace.CurrentCamera;
    if (camera === undefined || camera.ViewportSize.X < 1000 || !Packets.settings.get()?.FormatCurrencies) {
        return tostring(amount);
    }

    return CurrencyBundle.getFormatted(currency, amount, true);
}
