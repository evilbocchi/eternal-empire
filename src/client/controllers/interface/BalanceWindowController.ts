/**
 * @fileoverview Client controller responsible for managing the balance window UI and currency display.
 *
 * Handles:
 * - Displaying player currency balances and income
 * - Animating balance changes and currency gain effects
 * - Managing navigation between currency categories/pages
 * - Integrating with hotkeys, tooltips, and UI controllers
 * - Observing balance, revenue, and settings for live updates
 *
 * The controller maintains mappings between currencies and their UI elements, formats currency values, and coordinates with other controllers for UI and hotkey actions.
 *
 * @since 1.0.0
 */
import { BaseOnoeNum, OnoeNum } from "@antivivi/serikanum";
import { paintObjects } from "@antivivi/vrldk";
import { Controller, OnInit } from "@flamework/core";
import { Debris, TweenService, Workspace } from "@rbxts/services";
import StringBuilder from "@rbxts/stringbuilder";
import HotkeysController from "client/controllers/core/HotkeysController";
import { INTERFACE } from "client/controllers/core/UIController";
import TooltipController from "client/controllers/interface/TooltipController";
import { ASSETS, playSound } from "shared/asset/GameAssets";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import { DROPLET_STORAGE } from "shared/item/Droplet";
import ItemUtils from "shared/item/ItemUtils";
import Packets from "shared/Packets";
import Softcaps, { performSoftcap } from "shared/Softcaps";

declare global {
    type BalanceOption = Frame & {
        ImageLabel: ImageLabel;
        Amount: Frame & {
            BalanceLabel: TextLabel;
            Income: Frame & {
                IncomeLabel: TextLabel & {
                    UIStroke: UIStroke;
                };
                SoftcapLabel: TextLabel & {
                    UIStroke: UIStroke;
                };
            };
        };
        UIStroke: UIStroke;
    };

    type NavigationOption = Frame & {
        ImageButton: ImageButton;
    };

    interface Assets {
        BalanceWindow: Folder & {
            BalanceOption: BalanceOption;
        };
        CurrencyGain: Frame & {
            ImageLabel: ImageLabel;
            TextLabel: TextLabel & {
                UIStroke: UIStroke;
            };
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

/**
 * Controller responsible for managing the balance window UI, currency display, and related animations.
 *
 * Handles balance updates, navigation, and integration with hotkeys and tooltips.
 */
@Controller()
export default class BalanceWindowController implements OnInit {
    /** The original position of the balance window. */
    originalBalanceWindowPosition = BALANCE_WINDOW.Position;
    /** The current page/category being displayed. */
    page = 1;
    /** The maximum number of pages/categories. */
    maxPage = 1;
    /** Whether to format currencies with symbols and separators. */
    isFormatCurrencies = true;

    constructor(
        private hotkeysController: HotkeysController,
        private tooltipController: TooltipController,
    ) {}

    /**
     * Animates and hides the balance window.
     */
    hideBalanceWindow() {
        TweenService.Create(BALANCE_WINDOW, new TweenInfo(0.5), { Position: new UDim2(0.5, 0, -0.045, -50) }).Play();
    }

    /**
     * Animates and shows the balance window.
     */
    showBalanceWindow() {
        TweenService.Create(BALANCE_WINDOW, new TweenInfo(0.5), {
            Position: this.originalBalanceWindowPosition,
        }).Play();
    }

    /**
     * Gets or creates the UI option for a given currency.
     * @param currency The currency to get the option for.
     * @returns The BalanceOption UI element for the currency.
     */
    getCurrencyOption(currency: Currency) {
        let currencyOption = BALANCE_WINDOW.Balances.FindFirstChild(currency) as BalanceOption;
        if (currencyOption === undefined) {
            currencyOption = ASSETS.BalanceWindow.BalanceOption.Clone();
            const details = CURRENCY_DETAILS[currency];
            if (details === undefined) {
                throw `No details found for currency: ${currency}`;
            }
            const backgroundColor = details.color;
            paintObjects(currencyOption, backgroundColor);
            currencyOption.Amount.Income.SoftcapLabel.UIStroke.Color = new Color3(0.4, 0, 0);
            currencyOption.Name = currency;
            currencyOption.ImageLabel.Image = details.image;
            currencyOption.Amount.BalanceLabel.Text = this.format(currency, new OnoeNum(0));
            currencyOption.Amount.Income.Visible = false;
            currencyOption.Parent = BALANCE_WINDOW.Balances;
        }
        return currencyOption;
    }

    /**
     * Shows a floating difference label for a currency change.
     * @param currency The currency that changed.
     * @param diff The amount of change.
     */
    showDifference(currency: Currency, diff: BaseOnoeNum) {
        const currencyOption = this.getCurrencyOption(currency);
        const difference = new OnoeNum(diff);
        const labels = currencyOption.Amount;
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
            Rotation: diffLabel.Rotation + math.random(-45, 45),
        }).Play();
        TweenService.Create(diffLabel.UIStroke, tweenInfo, { Transparency: 1 }).Play();
        diffLabel.Parent = INTERFACE;
        Debris.AddItem(diffLabel, 6);
    }

    /**
     * Refreshes the balance window, updating all currency displays.
     * @param balance The current balance map (optional).
     */
    refreshBalanceWindow(balance = Packets.balance.get()) {
        let size = 100;
        let maxPage = 1;
        for (const [currency, details] of pairs(CURRENCY_DETAILS)) {
            const c = balance?.get(currency);
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

            const tooltipBuilder = new StringBuilder()
                .append("You have ")
                .append(amount.toString())
                .append(" ")
                .append(currency);

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
                    if (lowestStart === undefined || divStarts.lessThan(lowestStart)) lowestStart = divStarts;
                }
                const softcapLabel = builder.toString();
                labels.Income.SoftcapLabel.Text = softcapLabel;
                if (capped === true) {
                    tooltipBuilder.append(
                        `\n<font color="rgb(255, 0, 0)" size="16">After ${CurrencyBundle.getFormatted(currency, lowestStart)}, a softcap of ${softcapLabel} is applied to ${currency} gain!</font>`,
                    );
                }
            }

            labels.Income.SoftcapLabel.Visible = capped;

            this.tooltipController.setMessage(currencyOption, tooltipBuilder.toString());

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
        BALANCE_WINDOW.Balances.NavigationOptions.PageLabel.Text = CurrencyBundle.getCategory(this.page) ?? "Main";
        const newSize = new UDim2(0, size, 1, 0);
        if (BALANCE_WINDOW.Balances.CanvasSize !== newSize) BALANCE_WINDOW.Balances.CanvasSize = newSize;
    }

    /**
     * Loads navigation option UI and hotkey for a given navigation button.
     * @param navOption The navigation option UI element.
     * @param hotkey The hotkey to bind.
     * @param label The label for the hotkey.
     * @param action The action to perform on navigation.
     * @param priority Optional hotkey priority.
     */
    loadNavigationOption(
        navOption: NavigationOption,
        hotkey: Enum.KeyCode,
        label: string,
        action: () => boolean,
        priority?: number,
    ) {
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
        this.hotkeysController.setHotkey(
            navOption.ImageButton,
            hotkey,
            () => {
                if (!BALANCE_WINDOW.Balances.NavigationOptions.Visible) {
                    return false;
                }
                const success = action();
                navOption.ImageButton.Size = new UDim2(1.15, 0, 1.15, 0);
                TweenService.Create(navOption.ImageButton, new TweenInfo(0.3), { Size: new UDim2(1, 0, 1, 0) }).Play();
                playSound("MenuClick.mp3");
                return success;
            },
            label,
            priority,
        );
    }

    /**
     * Shows animated currency gain at a world position.
     * @param at The world position to show the gain.
     * @param amountPerCurrency Map of currency to amount gained.
     */
    showCurrencyGain(at: Vector3, amountPerCurrency: Map<Currency, BaseOnoeNum>) {
        if (!Packets.settings.get()?.CurrencyGainAnimation) {
            const part = new Instance("Part");
            part.Size = new Vector3(1, 1, 1);
            part.Position = at;
            part.Anchored = true;
            part.CanCollide = false;
            part.Transparency = 1;
            part.Parent = Workspace;
            ItemUtils.loadDropletGui(amountPerCurrency).Parent = part;
            Debris.AddItem(part, 2);
            return;
        }

        const camera = Workspace.CurrentCamera;
        if (camera === undefined) return;
        if (at.sub(camera.CFrame.Position).Magnitude > 50) {
            return;
        }
        const [location, withinBounds] = camera.WorldToScreenPoint(at);
        if (!withinBounds) return;

        const tweenInfo = new TweenInfo(1, Enum.EasingStyle.Quart, Enum.EasingDirection.In);
        const ySize = ASSETS.CurrencyGain.AbsoluteSize.Y;
        let i = 0;
        const qualityLevel = ItemUtils.UserGameSettings!.SavedQualityLevel;
        for (const [currency, amount] of amountPerCurrency) {
            const details = CURRENCY_DETAILS[currency];
            if (details === undefined) continue;
            const currencyOption = this.getCurrencyOption(currency);
            if (!currencyOption.Visible) continue;

            const gainWindow = ASSETS.CurrencyGain.Clone();
            gainWindow.ImageLabel.Image = details.image;
            gainWindow.TextLabel.Text = this.format(currency, new OnoeNum(amount));
            gainWindow.TextLabel.TextColor3 = details.color;
            const elementTo = currencyOption.ImageLabel;
            const destination = elementTo.AbsolutePosition.sub(INTERFACE.AbsolutePosition).add(
                elementTo.AbsoluteSize.div(2),
            );

            TweenService.Create(gainWindow, tweenInfo, {
                Position: UDim2.fromOffset(destination.X, destination.Y),
                Rotation: gainWindow.Rotation + math.random(-45, 45),
            }).Play();

            if (qualityLevel.Value > 5) {
                TweenService.Create(gainWindow.ImageLabel, tweenInfo, { ImageTransparency: 1 }).Play();
                TweenService.Create(gainWindow.TextLabel, tweenInfo, { TextTransparency: 1 }).Play();
                TweenService.Create(gainWindow.TextLabel.UIStroke, tweenInfo, { Transparency: 1 }).Play();
            }

            Debris.AddItem(gainWindow, 1);
            gainWindow.Parent = INTERFACE;
            const size = gainWindow.AbsoluteSize;
            gainWindow.Position = UDim2.fromOffset(location.X - size.X / 2, location.Y + i * ySize + size.Y / 2);
            i++;
        }
    }

    /**
     * Formats a currency value for display.
     * @param currency The currency type.
     * @param amount The amount to format.
     * @returns The formatted string.
     */
    format(currency: Currency, amount: OnoeNum) {
        if (this.isFormatCurrencies) return CurrencyBundle.getFormatted(currency, amount, true);
        else return tostring(amount);
    }

    /**
     * Initializes the BalanceWindowController, sets up event listeners and navigation.
     */
    onInit() {
        ItemUtils.showCurrencyGain = (at: Vector3, amountPerCurrency: Map<Currency, BaseOnoeNum>) => {
            this.showCurrencyGain(at, amountPerCurrency);
        };

        this.loadNavigationOption(
            BALANCE_WINDOW.Balances.NavigationOptions.Left,
            Enum.KeyCode.Z,
            "Previous Page",
            () => {
                if (this.page === 1) {
                    this.page = this.maxPage;
                } else {
                    this.page -= 1;
                }
                this.refreshBalanceWindow();
                return true;
            },
        );

        this.loadNavigationOption(BALANCE_WINDOW.Balances.NavigationOptions.Right, Enum.KeyCode.C, "Next Page", () => {
            if (this.page === this.maxPage) {
                this.page = 1;
            } else {
                this.page += 1;
            }
            this.refreshBalanceWindow();
            return true;
        });

        Packets.balance.observe((value) => this.refreshBalanceWindow(value));
        Packets.showDifference.fromServer((differencePerCurrency) => {
            for (const [currency, diff] of differencePerCurrency) {
                this.showDifference(currency, diff);
            }
        });

        Packets.dropletBurnt.fromServer((dropletModelId, amountPerCurrency) => {
            const dropletModel = DROPLET_STORAGE.FindFirstChild(dropletModelId) as BasePart | undefined;
            if (dropletModel === undefined) {
                return;
            }
            this.showCurrencyGain(dropletModel.Position, amountPerCurrency);
        });

        Packets.revenue.observe((revenue) => {
            for (const [currency, amount] of revenue) {
                const change = new OnoeNum(amount);
                const currencyOptionLabels = this.getCurrencyOption(currency).Amount;
                currencyOptionLabels.Income.Visible = !change.lessEquals(0);
                currencyOptionLabels.Income.IncomeLabel.Text = this.format(currency, change) + "/s";
            }
        });

        Packets.settings.observe(
            (value) => (this.isFormatCurrencies = INTERFACE.AbsoluteSize.X < 1000 ? false : value.FormatCurrencies),
        );
    }
}
