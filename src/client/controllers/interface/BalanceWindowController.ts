import { OnoeNum } from "@antivivi/serikanum";
import { Controller, OnInit } from "@flamework/core";
import { TweenService } from "@rbxts/services";
import { BALANCE_WINDOW, INTERFACE, NavigationOption } from "client/constants";
import { HotkeysController } from "client/controllers/HotkeysController";
import { UIController } from "client/controllers/UIController";
import { TooltipController } from "client/controllers/interface/TooltipController";
import Price from "shared/Price";
import Softcaps, { performSoftcap } from "shared/Softcaps";
import { ASSETS } from "shared/constants";
import Packets from "shared/network/Packets";
import StringBuilder from "shared/utils/StringBuilder";
import { paintObjects } from "shared/utils/vrldk/UIUtils";

declare global {
    type BalanceOption = Frame & {
        ImageLabel: ImageLabel,
        Amount: Frame & {
            BalanceLabel: TextLabel,
            Income: Frame & {
                IncomeLabel: TextLabel,
                SoftcapLabel: TextLabel & {
                    UIStroke: UIStroke
                },
            }
        }
        UIStroke: UIStroke,
    }
}

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
            currencyOption.Amount.Income.SoftcapLabel.UIStroke.Color = new Color3(0.4, 0, 0);
            currencyOption.Name = currency;
            currencyOption.ImageLabel.Image = "rbxassetid://" + details?.image;
            currencyOption.Amount.BalanceLabel.Text = this.format(currency, new OnoeNum(0));
            currencyOption.Amount.Income.Visible = false;
            currencyOption.Parent = BALANCE_WINDOW.Balances;
        }
        return currencyOption;
    }

    refreshBalanceWindow(balance = Packets.balance.get()) {
        let size = 100;
        let maxPage = 1;
        for (const [currency, details] of pairs(Price.DETAILS_PER_CURRENCY)) {
            const c = balance.get(currency);
            const cost = new OnoeNum(c === undefined ? 0 : c); 
            const exists = !cost.lessEquals(0);
            const currencyOption = this.getCurrencyOption(currency);

            currencyOption.Visible = (exists || currency === "Funds") && this.page === details.page;
            if (currencyOption.Visible === true) {
                size += currencyOption.AbsoluteSize.X;
            }
            const amountLabel = this.format(currency, cost);
            const labels = currencyOption.Amount;
            labels.BalanceLabel.Text = amountLabel;
            const softcap = Softcaps[currency];
            let capped = false;

            const tooltipBuilder = new StringBuilder().append("You have ").append(cost.toString()).append(" ").append(currency);

            if (softcap !== undefined) {
                const builder = new StringBuilder();
                const [recippow, recippowStarts] = performSoftcap(cost, softcap.recippow);
                let lowestStart: OnoeNum | undefined;
                if (recippow !== undefined) {
                    capped = true;
                    builder.append("^(1/").append(recippow.toString()).append(")");
                    lowestStart = recippowStarts;
                }
                const [div, divStarts] = performSoftcap(cost, softcap.div);
                if (div !== undefined) {
                    capped = true;
                    builder.append("/").append(div.toString());
                    if (lowestStart === undefined || divStarts.lessThan(lowestStart))
                        lowestStart = divStarts;
                }
                const softcapLabel = builder.toString();
                labels.Income.SoftcapLabel.Text = softcapLabel;
                if (capped === true) {
                    tooltipBuilder.append(`\n<font color="rgb(255, 0, 0)" size="16">After ${Price.getFormatted(currency, lowestStart)}, a softcap of ${softcapLabel} is applied to ${currency} gain!</font>`);
                }
            }
            labels.Income.SoftcapLabel.Visible = capped;

            this.tooltipController.setTooltip(currencyOption, tooltipBuilder.toString());

            currencyOption.LayoutOrder = details.layoutOrder;
            if (exists && details.page !== undefined && details.page > maxPage) {
                maxPage = details.page;
            }
        }
        this.maxPage = maxPage;
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

        Packets.balance.observe((value) => this.refreshBalanceWindow(value));

        Packets.income.observe((income) => {
            for (const [currency, cost] of income) {
                const change = new OnoeNum(cost);
                const currencyOptionLabels = this.getCurrencyOption(currency).Amount;
                currencyOptionLabels.Income.Visible = !change.lessEquals(0);
                currencyOptionLabels.Income.IncomeLabel.Text = this.format(currency, change) + "/s";
            }
        });

        Packets.settings.observe((value) => this.isFormatCurrencies = INTERFACE.AbsoluteSize.X < 1000 ? false : value.FormatCurrencies);
    }
}