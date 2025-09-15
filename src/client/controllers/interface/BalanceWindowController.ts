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
import Softcaps, { performSoftcap } from "shared/currency/mechanics/Softcaps";

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

// /**
//  * Controller responsible for managing the balance window UI, currency display, and related animations.
//  *
//  * Handles balance updates, navigation, and integration with hotkeys and tooltips.
//  */
// @Controller()
// export default class BalanceWindowController implements OnInit {
//     /** The current page/category being displayed. */
//     page = 1;
//     /** The maximum number of pages/categories. */
//     maxPage = 1;
//     /** Whether to format currencies with symbols and separators. */
//     isFormatCurrencies = true;

//     /**
//      * Shows a floating difference label for a currency change.
//      * @param currency The currency that changed.
//      * @param diff The amount of change.
//      */
//     showDifference(currency: Currency, diff: BaseOnoeNum) {
//         const currencyOption = this.getCurrencyOption(currency);
//         const difference = new OnoeNum(diff);
//         const labels = currencyOption.Amount;
//         const diffLabel = labels.Income.IncomeLabel.Clone();
//         diffLabel.AnchorPoint = new Vector2(0.5, 0.5);

//         const position = currencyOption.AbsolutePosition.sub(INTERFACE.AbsolutePosition);
//         const x = position.X + currencyOption.ImageLabel.AbsoluteSize.X / 2;
//         const y = position.Y + currencyOption.AbsoluteSize.Y + 10;
//         diffLabel.Position = UDim2.fromOffset(x, y);
//         diffLabel.Size = new UDim2(0, 0, 0, 0);
//         diffLabel.AutomaticSize = Enum.AutomaticSize.XY;
//         diffLabel.TextSize = 20;
//         diffLabel.TextScaled = false;
//         diffLabel.Text = `${difference.moreThan(0) ? "+" : "-"}${this.format(currency, difference)}`;
//         diffLabel.Rotation = math.random(-10, 10);
//         diffLabel.ZIndex = 3;
//         const tweenInfo = new TweenInfo(1, Enum.EasingStyle.Quart, Enum.EasingDirection.In);
//         const transitioningPosition = diffLabel.Position.add(new UDim2(0, 0, 0, 50));
//         TweenService.Create(diffLabel, tweenInfo, {
//             Position: transitioningPosition,
//             TextTransparency: 1,
//             Rotation: diffLabel.Rotation + math.random(-45, 45),
//         }).Play();
//         TweenService.Create(diffLabel.UIStroke, tweenInfo, { Transparency: 1 }).Play();
//         diffLabel.Parent = INTERFACE;
//         Debris.AddItem(diffLabel, 6);
//     }

//     /**
//      * Shows animated currency gain at a world position.
//      * @param at The world position to show the gain.
//      * @param amountPerCurrency Map of currency to amount gained.
//      */
//     showCurrencyGain(at: Vector3, amountPerCurrency: Map<Currency, BaseOnoeNum>) {
//         if (!Packets.settings.get()?.CurrencyGainAnimation) {
//             const part = new Instance("Part");
//             part.Size = new Vector3(1, 1, 1);
//             part.Position = at;
//             part.Anchored = true;
//             part.CanCollide = false;
//             part.Transparency = 1;
//             part.Parent = Workspace;
//             ItemUtils.loadDropletGui(amountPerCurrency).Parent = part;
//             Debris.AddItem(part, 2);
//             return;
//         }

//         const camera = Workspace.CurrentCamera;
//         if (camera === undefined) return;
//         if (at.sub(camera.CFrame.Position).Magnitude > 50) {
//             return;
//         }
//         const [location, withinBounds] = camera.WorldToScreenPoint(at);
//         if (!withinBounds) return;

//         const tweenInfo = new TweenInfo(1, Enum.EasingStyle.Quart, Enum.EasingDirection.In);
//         const ySize = ASSETS.CurrencyGain.AbsoluteSize.Y;
//         let i = 0;
//         const qualityLevel = ItemUtils.UserGameSettings!.SavedQualityLevel;
//         for (const [currency, amount] of amountPerCurrency) {
//             const details = CURRENCY_DETAILS[currency];
//             if (details === undefined) continue;
//             const currencyOption = this.getCurrencyOption(currency);
//             if (!currencyOption.Visible) continue;

//             const gainWindow = ASSETS.CurrencyGain.Clone();
//             gainWindow.ImageLabel.Image = details.image;
//             gainWindow.TextLabel.Text = this.format(currency, new OnoeNum(amount));
//             gainWindow.TextLabel.TextColor3 = details.color;
//             const elementTo = currencyOption.ImageLabel;
//             const destination = elementTo.AbsolutePosition.sub(INTERFACE.AbsolutePosition).add(
//                 elementTo.AbsoluteSize.div(2),
//             );

//             TweenService.Create(gainWindow, tweenInfo, {
//                 Position: UDim2.fromOffset(destination.X, destination.Y),
//                 Rotation: gainWindow.Rotation + math.random(-45, 45),
//             }).Play();

//             if (qualityLevel.Value > 5) {
//                 TweenService.Create(gainWindow.ImageLabel, tweenInfo, { ImageTransparency: 1 }).Play();
//                 TweenService.Create(gainWindow.TextLabel, tweenInfo, { TextTransparency: 1 }).Play();
//                 TweenService.Create(gainWindow.TextLabel.UIStroke, tweenInfo, { Transparency: 1 }).Play();
//             }

//             Debris.AddItem(gainWindow, 1);
//             gainWindow.Parent = INTERFACE;
//             const size = gainWindow.AbsoluteSize;
//             gainWindow.Position = UDim2.fromOffset(location.X - size.X / 2, location.Y + i * ySize + size.Y / 2);
//             i++;
//         }
//     }

//     /**
//      * Initializes the BalanceWindowController, sets up event listeners and navigation.
//      */
//     onInit() {
//         ItemUtils.showCurrencyGain = (at: Vector3, amountPerCurrency: Map<Currency, BaseOnoeNum>) => {
//             this.showCurrencyGain(at, amountPerCurrency);
//         };

//         Packets.balance.observe((value) => this.refreshBalanceWindow(value));
//         Packets.showDifference.fromServer((differencePerCurrency) => {
//             for (const [currency, diff] of differencePerCurrency) {
//                 this.showDifference(currency, diff);
//             }
//         });

//         Packets.dropletBurnt.fromServer((dropletModelId, amountPerCurrency) => {
//             const dropletModel = DROPLET_STORAGE.FindFirstChild(dropletModelId) as BasePart | undefined;
//             if (dropletModel === undefined) {
//                 return;
//             }
//             this.showCurrencyGain(dropletModel.Position, amountPerCurrency);
//         });

//         Packets.revenue.observe((revenue) => {
//             for (const [currency, amount] of revenue) {
//                 const change = new OnoeNum(amount);
//                 const currencyOptionLabels = this.getCurrencyOption(currency).Amount;
//                 currencyOptionLabels.Income.Visible = !change.lessEquals(0);
//                 currencyOptionLabels.Income.IncomeLabel.Text = this.format(currency, change) + "/s";
//             }
//         });

//         Packets.settings.observe(
//             (value) => (this.isFormatCurrencies = INTERFACE.AbsoluteSize.X < 1000 ? false : value.FormatCurrencies),
//         );
//     }
// }
