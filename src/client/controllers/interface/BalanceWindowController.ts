import { OnoeNum } from "@antivivi/serikanum";
import { Controller, OnInit } from "@flamework/core";
import { Debris, TweenService } from "@rbxts/services";
import StringBuilder from "@rbxts/stringbuilder";
import { HotkeysController } from "client/controllers/HotkeysController";
import { INTERFACE, UIController } from "client/controllers/UIController";
import { TooltipController } from "client/controllers/interface/TooltipController";
import Packets from "shared/Packets";
import Softcaps, { performSoftcap } from "shared/Softcaps";
import { ASSETS } from "shared/GameAssets";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import { paintObjects } from "@antivivi/vrldk";
import CurrencyMap from "shared/currency/CurrencyMap";

declare global {
    type BalanceOption = Frame & {
        ImageLabel: ImageLabel,
        Amount: Frame & {
            BalanceLabel: TextLabel,
            Income: Frame & {
                IncomeLabel: TextLabel & {
                    UIStroke: UIStroke;
                },
                SoftcapLabel: TextLabel & {
                    UIStroke: UIStroke;
                },
            };
        };
        UIStroke: UIStroke,
    };

    type NavigationOption = Frame & {
        ImageButton: ImageButton;
    };

    interface Assets {
        BalanceWindow: Folder & {
            BalanceOption: BalanceOption;
        };
    }
}

export const BALANCE_WINDOW = INTERFACE.WaitForChild("BalanceWindow") as Frame & {
    Balances: ScrollingFrame & {
        NavigationOptions: Frame & {
            Left: NavigationOption;
            Right: NavigationOption;
            PageLabel: TextLabel;
        };
    };
    TitleLabel: TextLabel;
};

@Controller()
export class BalanceWindowController implements OnInit {

    private lastBalance = Packets.balance.get();
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
            const details = CURRENCY_DETAILS[currency];
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
        for (const [currency, details] of pairs(CURRENCY_DETAILS)) {
            const c = balance.get(currency);
            const amount = new OnoeNum(c === undefined ? 0 : c);

            const exists = !amount.lessEquals(0);
            const currencyOption = this.getCurrencyOption(currency);
            const isVisible = (exists || currency === "Funds") && this.page === details.page;

            currencyOption.Visible = isVisible;
            if (isVisible === true) {
                size += currencyOption.AbsoluteSize.X;
            }
            const amountLabel = this.format(currency, amount);
            const labels = currencyOption.Amount;
            labels.BalanceLabel.TextSize = labels.BalanceLabel.AbsoluteSize.Y;
            labels.BalanceLabel.Text = amountLabel;
            const softcap = Softcaps[currency];
            let capped = false;

            const tooltipBuilder = new StringBuilder().append("You have ").append(amount.toString()).append(" ").append(currency);

            if (softcap !== undefined) {
                const builder = new StringBuilder();
                const [recippow, recippowStarts] = performSoftcap(amount, softcap.recippow);
                let lowestStart: OnoeNum | undefined;
                if (recippow !== undefined) {
                    capped = true;
                    builder.append("^(1/").append(recippow.toString()).append(")");
                    lowestStart = recippowStarts;
                }
                const [div, divStarts] = performSoftcap(amount, softcap.div);
                if (div !== undefined) {
                    capped = true;
                    builder.append("/").append(div.toString());
                    if (lowestStart === undefined || divStarts.lessThan(lowestStart))
                        lowestStart = divStarts;
                }
                const softcapLabel = builder.toString();
                labels.Income.SoftcapLabel.Text = softcapLabel;
                if (capped === true) {
                    tooltipBuilder.append(`\n<font color="rgb(255, 0, 0)" size="16">After ${CurrencyBundle.getFormatted(currency, lowestStart)}, a softcap of ${softcapLabel} is applied to ${currency} gain!</font>`);
                }
            }

            const last = this.lastBalance.get(currency);
            const difference = last === undefined ? undefined : amount.sub(last);
            if (isVisible && difference !== undefined && !difference.equals(0)) {
                const diffLabel = labels.Income.IncomeLabel.Clone();
                diffLabel.AnchorPoint = new Vector2(0.5, 0.5);

                const position = currencyOption.AbsolutePosition.sub(INTERFACE.AbsolutePosition);
                const x = position.X + currencyOption.ImageLabel.AbsoluteSize.X / 2;
                const y = position.Y + currencyOption.AbsoluteSize.Y + 10;
                diffLabel.Position = UDim2.fromOffset(x, y);
                diffLabel.Size = new UDim2(0, 0, 0, 0);
                diffLabel.AutomaticSize = Enum.AutomaticSize.XY;
                diffLabel.TextSize = 20;
                diffLabel.TextScaled = false;
                diffLabel.Text = `${difference.moreThan(0) ? "+" : "-"}${this.format(currency, difference)}`;
                diffLabel.Rotation = math.random(-10, 10);
                diffLabel.ZIndex = 3;
                const tweenInfo = new TweenInfo(1, Enum.EasingStyle.Quart, Enum.EasingDirection.In);
                const transitioningPosition = diffLabel.Position.add(new UDim2(0, 0, 0, 50));
                TweenService.Create(diffLabel, tweenInfo, {
                    Position: transitioningPosition,
                    TextTransparency: 1,
                    Rotation: diffLabel.Rotation + math.random(-45, 45)
                }).Play();
                TweenService.Create(diffLabel.UIStroke, tweenInfo, { Transparency: 1 }).Play();
                diffLabel.Parent = INTERFACE;
                Debris.AddItem(diffLabel, 6);
            }

            labels.Income.SoftcapLabel.Visible = capped;

            this.tooltipController.setMessage(currencyOption, tooltipBuilder.toString());

            currencyOption.LayoutOrder = details.layoutOrder;
            if (exists && details.page !== undefined && details.page > maxPage) {
                maxPage = details.page;
            }
        }
        this.maxPage = maxPage;
        this.lastBalance = balance;

        if (this.maxPage === 1 && this.page > 1) {
            this.page = 1;
            this.refreshBalanceWindow(balance);
            return;
        }
        BALANCE_WINDOW.Balances.NavigationOptions.Visible = this.maxPage > 1;
        BALANCE_WINDOW.Balances.NavigationOptions.PageLabel.Text = CurrencyBundle.getCategory(this.page) ?? "Main";
        const newSize = new UDim2(0, size, 1, 0);
        if (BALANCE_WINDOW.Balances.CanvasSize !== newSize)
            BALANCE_WINDOW.Balances.CanvasSize = newSize;

    }

    loadNavigationOption(navOption: NavigationOption, hotkey: Enum.KeyCode, label: string, action: () => boolean, priority?: number) {
        const highlight = () => {
            TweenService.Create(navOption.ImageButton, new TweenInfo(0.3), { ImageTransparency: 0 }).Play();
        };
        const unhighlight = () => {
            TweenService.Create(navOption.ImageButton, new TweenInfo(0.3), { ImageTransparency: 0.5 }).Play();
        };
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
            return CurrencyBundle.getFormatted(currency, amount, true);
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

        Packets.revenue.observe((revenue) => {
            for (const [currency, amount] of revenue) {
                const change = new OnoeNum(amount);
                const currencyOptionLabels = this.getCurrencyOption(currency).Amount;
                currencyOptionLabels.Income.Visible = !change.lessEquals(0);
                currencyOptionLabels.Income.IncomeLabel.Text = this.format(currency, change) + "/s";
            }
        });

        Packets.settings.observe((value) => this.isFormatCurrencies = INTERFACE.AbsoluteSize.X < 1000 ? false : value.FormatCurrencies);
    }
}