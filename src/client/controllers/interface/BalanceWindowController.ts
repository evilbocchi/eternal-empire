import { Controller, OnInit } from "@flamework/core";
import { TweenService } from "@rbxts/services";
import { BALANCE_WINDOW, NavigationOption } from "client/constants";
import Price from "shared/Price";
import { BalanceOption, Currency, UI_ASSETS } from "shared/constants";
import { Fletchette } from "shared/utils/fletchette";
import InfiniteMath, { max } from "shared/utils/infinitemath/InfiniteMath";
import { paintObjects } from "shared/utils/vrldk/UIUtils";
import { HotkeysController } from "../HotkeysController";
import { UIController } from "../UIController";

const CurrencyCanister = Fletchette.getCanister("CurrencyCanister");

@Controller()
export class BalanceWindowController implements OnInit {

    page = 1;
    maxPage = 1;
    
    constructor(private uiController: UIController, private hotkeysController: HotkeysController) {

    }

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
            const backgroundColor = Price.DETAILS_PER_CURRENCY[currency].color ?? new Color3(1, 1, 1);
            paintObjects(currencyOption, backgroundColor);
            currencyOption.Name = currency;
            currencyOption.CurrencyLabel.Text = currency;
            currencyOption.Parent = BALANCE_WINDOW.Balances;
        }
        return currencyOption;
    }

    refreshBalanceWindow(balance?: Map<Currency, InfiniteMath>) {
        if (balance !== undefined) {
            let maxPage = 1;
            for (const [currency, details] of pairs(Price.DETAILS_PER_CURRENCY)) {
                let cost = balance.get(currency);
                cost = new InfiniteMath(cost === undefined ? 0 : cost); 
                const exists = !cost.le(0);
                const currencyOption = this.getCurrencyOption(currency);
                currencyOption.Visible = exists && this.page === details.page;
                currencyOption.BalanceLabel.Text = exists ? Price.getFormatted(currency, cost, true) : "0";
                currencyOption.LayoutOrder = details.layoutOrder;
                if (exists && details.page !== undefined && details.page > maxPage) {
                    maxPage = details.page;
                }
            }
            this.maxPage = maxPage;
        }
        if (this.maxPage === 1 && this.page > 1) {
            this.page = 1;
            this.refreshBalanceWindow(balance);
            return;
        }
        BALANCE_WINDOW.NavigationOptions.Visible = this.maxPage > 1;
        BALANCE_WINDOW.NavigationOptions.PageLabel.Text = Price.getCategory(this.page) ?? "Main";
    }

    loadNavigationOption(navOption: NavigationOption, hotkey: Enum.KeyCode, label: string, action: () => boolean) {
        const highlight = () => {
            TweenService.Create(navOption.ImageButton, new TweenInfo(0.3), { ImageTransparency: 0 }).Play();
        }
        const unhighlight = () => {
            TweenService.Create(navOption.ImageButton, new TweenInfo(0.3), { ImageTransparency: 0.5 }).Play();
        }
        unhighlight();

        navOption.MouseEnter.Connect(() => highlight());
        navOption.MouseMoved.Connect(() => highlight());
        navOption.MouseLeave.Connect(() => unhighlight());
        this.hotkeysController.setHotkey(navOption.ImageButton, hotkey, () => {
            if (!BALANCE_WINDOW.NavigationOptions.Visible) {
                return false;
            }
            const success = action();
            navOption.ImageButton.Size = new UDim2(0.85, 0, 0.85, 0);
            TweenService.Create(navOption.ImageButton, new TweenInfo(0.3), { Size: new UDim2(0.7, 0, 0.7, 0) }).Play();
            this.uiController.playSound("Click");
            return success;
        }, label)
    }

    onInit() {
        this.loadNavigationOption(BALANCE_WINDOW.NavigationOptions.Left, Enum.KeyCode.Z, "Previous Page", () => {
            if (this.page === 1) {
                this.page = this.maxPage;
            }
            else {
                this.page -= 1;
            }
            this.refreshBalanceWindow();
            return true;
        });

        this.loadNavigationOption(BALANCE_WINDOW.NavigationOptions.Right, Enum.KeyCode.C, "Next Page", () => {
            if (this.page === this.maxPage) {
                this.page = 1;
            }
            else {
                this.page += 1;
            }
            this.refreshBalanceWindow();
            return true;
        });

        CurrencyCanister.balance.observe((value) => this.refreshBalanceWindow(value));

        task.spawn(() => {
            const logsPerCurrency = new Map<Currency, {balance: InfiniteMath, t: number}[]>();
            while (task.wait(1)) {
                const t = tick();
                const balance = CurrencyCanister.balance.get();
                for (const [currency, cost] of balance) {
                    const logs = logsPerCurrency.get(currency) ?? [];
                    const newLogs: typeof logs = [];
                    let change = new InfiniteMath(0);
                    for (const log of logs) {
                        const dt = t - log.t;
                        if (dt > 5)
                            continue;
                        change = change.add((new InfiniteMath(cost).sub(log.balance)).div(dt)).mul(0.5);
                        newLogs.push(log);
                    }
                    newLogs.push({balance: cost, t: t});
                    logsPerCurrency.set(currency, newLogs);
                    this.getCurrencyOption(currency).IncomeLabel.Text = Price.getFormatted(currency, change.lt(0) ? new InfiniteMath(0) : change, true) + "/s";
                }
            }
        });
    }
}