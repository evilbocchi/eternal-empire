import { Controller, OnInit, OnStart } from "@flamework/core";
import { Workspace } from "@rbxts/services";
import { BALANCE_WINDOW } from "client/constants";
import Price from "shared/Price";
import { BalanceOption, Currency, UI_ASSETS } from "shared/constants";
import { Fletchette } from "shared/utils/fletchette";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";
import { paintObjects } from "shared/utils/vrldk/UIUtils";

const CurrencyCanister = Fletchette.getCanister("CurrencyCanister");

@Controller()
export class BalanceWindowController implements OnInit {
    currencies = new Map<Currency, InfiniteMath>();

    hideBalanceWindow() {
        return BALANCE_WINDOW.Visible = false;
    }
    
    showBalanceWindow() {
        return BALANCE_WINDOW.Visible = true;
    }
    
    getCurrencyOption(currency: Currency) {
        let currencyOption = BALANCE_WINDOW.Balances.FindFirstChild(currency) as BalanceOption;
        if (currencyOption === undefined) {
            currencyOption = UI_ASSETS.BalanceWindow.BalanceOption.Clone();
            const backgroundColor = Price.COLORS[currency] ?? new Color3(1, 1, 1);
            paintObjects(currencyOption, backgroundColor);
            currencyOption.Name = currency;
            currencyOption.CurrencyLabel.Text = currency;
            currencyOption.Parent = BALANCE_WINDOW.Balances;
        }
        return currencyOption;
    }

    getLayoutOrder(currency: Currency) {
        switch (currency) {
            case "Funds":
                return 0;
            case "Power":
                return 1;
            case "Bitcoin":
                return 2;
            default:
                return -1;
        }
    }

    refreshCurrency(currency: Currency, balance: InfiniteMath) {
        const currencyOption = this.getCurrencyOption(currency);
        currencyOption.Visible = !balance.le(0);
        currencyOption.BalanceLabel.Text = Price.getFormatted(currency, balance, true);
        currencyOption.LayoutOrder = this.getLayoutOrder(currency);
        this.currencies.set(currency, balance);
    }

    onInit() {
        CurrencyCanister.balance.observe((value) => {
            for (const [currency, cost] of pairs(value)) {
                this.refreshCurrency(currency, new InfiniteMath(cost));
            }
        });

        task.spawn(() => {
            const logsPerCurrency = new Map<Currency, {balance: InfiniteMath, t: number}[]>();
            while (task.wait(1)) {
                const t = tick();
                for (const [currency, bal] of this.currencies) {
                    const logs = logsPerCurrency.get(currency) ?? [];
                    const newLogs: typeof logs = [];
                    let change = new InfiniteMath(0);
                    for (const log of logs) {
                        const dt = t - log.t;
                        if (dt > 5)
                            continue;
                        change = change.add((bal.sub(log.balance)).div(dt)).mul(0.5);
                        newLogs.push(log);
                    }
                    newLogs.push({balance: bal, t: t});
                    logsPerCurrency.set(currency, newLogs);
                    this.getCurrencyOption(currency).IncomeLabel.Text = Price.getFormatted(currency, change.lt(0) ? new InfiniteMath(0) : change, true) + "/s";
                }
            }
        });
    }
}