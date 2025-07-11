import { Controller, OnInit } from "@flamework/core";
import { TweenService } from "@rbxts/services";
import { BALANCE_WINDOW, INTERFACE, NavigationOption } from "client/constants";
import { HotkeysController } from "client/controllers/HotkeysController";
import { UIController } from "client/controllers/UIController";
import { TooltipController } from "client/controllers/interface/TooltipController";
import Price from "shared/Price";
import { BalanceOption, ASSETS } from "shared/constants";
import { OnoeNum } from "@antivivi/serikanum";
import { paintObjects } from "shared/utils/vrldk/UIUtils";
import Queue from "shared/utils/Queue";
import { Fletchette } from "@antivivi/fletchette";

const CurrencyCanister = Fletchette.getCanister("CurrencyCanister");

@Controller()
export class BalanceWindowController implements OnInit {

    originalBalanceWindowPosition = BALANCE_WINDOW.Position;
    page = 1;
    maxPage = 1;
    isFormatCurrencies = true;

    constructor(private uiController: UIController, private hotkeysController: HotkeysController, private tooltipController: TooltipController) {

    }

    hideBalanceWindow() {
        TweenService.Create(BALANCE_WINDOW, new TweenInfo(0.5), { Position: new UDim2(0.5, 0, -0.045, -50) }).Play();
    }
    
    showBalanceWindow() {
        TweenService.Create(BALANCE_WINDOW, new TweenInfo(0.5), { Position: this.originalBalanceWindowPosition }).Play();
    }
    
    getCurrencyOption(currency: Currency) {
        let currencyOption = BALANCE_WINDOW.Balances.FindFirstChild(currency) as BalanceOption;
        if (currencyOption === undefined) {
            currencyOption = ASSETS.BalanceWindow.BalanceOption.Clone();
            const details = Price.DETAILS_PER_CURRENCY[currency];
            const backgroundColor = details?.color ?? new Color3(1, 1, 1);
            paintObjects(currencyOption, backgroundColor);
            currencyOption.Name = currency;
            currencyOption.ImageLabel.Image = "rbxassetid://" + details?.image;
            this.tooltipController.setTooltip(currencyOption.ImageLabel, currency);
            currencyOption.Amount.BalanceLabel.Text = this.format(currency, new OnoeNum(0));
            currencyOption.Amount.IncomeLabel.Visible = false;
            currencyOption.Parent = BALANCE_WINDOW.Balances;
        }
        return currencyOption;
    }

    refreshBalanceWindow(balance?: Map<Currency, OnoeNum>) {
        let size = 100;
        if (balance !== undefined) {
            let maxPage = 1;
            for (const [currency, details] of pairs(Price.DETAILS_PER_CURRENCY)) {
                let cost = balance.get(currency);
                cost = new OnoeNum(cost === undefined ? 0 : cost); 
                const exists = !cost.lessEquals(0);
                const currencyOption = this.getCurrencyOption(currency);
                currencyOption.Visible = (exists || currency === "Funds") && this.page === details.page;
                if (currencyOption.Visible === true) {
                    size += currencyOption.AbsoluteSize.X;
                }
                currencyOption.Amount.BalanceLabel.Text = this.format(currency, cost);
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
        BALANCE_WINDOW.Balances.NavigationOptions.Visible = this.maxPage > 1;
        BALANCE_WINDOW.Balances.NavigationOptions.PageLabel.Text = Price.getCategory(this.page) ?? "Main";
        const newSize = new UDim2(0, size, 1, 0);
        if (BALANCE_WINDOW.Balances.CanvasSize !== newSize)
            BALANCE_WINDOW.Balances.CanvasSize = newSize;
    }

    loadNavigationOption(navOption: NavigationOption, hotkey: Enum.KeyCode, label: string, action: () => boolean, priority?: number) {
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
            if (!BALANCE_WINDOW.Balances.NavigationOptions.Visible) {
                return false;
            }
            const success = action();
            navOption.ImageButton.Size = new UDim2(1.15, 0, 1.15, 0);
            TweenService.Create(navOption.ImageButton, new TweenInfo(0.3), { Size: new UDim2(1, 0, 1, 0) }).Play();
            this.uiController.playSound("Click");
            return success;
        }, label, priority);
    }

    format(currency: Currency, amount: OnoeNum) {
        if (this.isFormatCurrencies)
            return Price.getFormatted(currency, amount, true);
        else
            return tostring(amount);
    }

    onInit() {
        this.loadNavigationOption(BALANCE_WINDOW.Balances.NavigationOptions.Left, Enum.KeyCode.Z, "Previous Page", () => {
            if (this.page === 1) {
                this.page = this.maxPage;
            }
            else {
                this.page -= 1;
            }
            this.refreshBalanceWindow();
            return true;
        });

        this.loadNavigationOption(BALANCE_WINDOW.Balances.NavigationOptions.Right, Enum.KeyCode.C, "Next Page", () => {
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
            const queuePerCurrency = new Map<Currency, Queue>();
            for (const [currency] of pairs(Price.DETAILS_PER_CURRENCY)) {
                queuePerCurrency.set(currency, new Queue());
            }
            while (task.wait(1)) {
                const balance = CurrencyCanister.balance.get();
                for (const [currency, cost] of pairs(balance)) {
                    const queue = queuePerCurrency.get(currency);
                    if (queue === undefined) {
                        continue;
                    }
                    queue.addToQueue(cost);
                    const change = queue.getAverageGain();
                    const currencyOptionLabels = this.getCurrencyOption(currency).Amount;
                    currencyOptionLabels.IncomeLabel.Visible = !change.lessEquals(0);
                    currencyOptionLabels.IncomeLabel.Text = this.format(currency, change) + "/s";
                }            
            }
        });

        Fletchette.getCanister("SettingsCanister").settings.observe((value) => this.isFormatCurrencies = INTERFACE.AbsoluteSize.X < 1000 ? false : value.FormatCurrencies);
    }
}