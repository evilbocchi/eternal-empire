/**
 * @fileoverview Client controller for managing the stats window and displaying player statistics.
 *
 * Handles:
 * - Displaying playtime, session time, and other tracked stats
 * - Showing most balance stats for each currency
 * - Integrating with UI and observing stat changes for live updates
 *
 * The controller manages stat UI updates, listens for relevant events, and updates the stats window with current values.
 *
 * @since 1.0.0
 */
import { OnoeNum } from "@antivivi/serikanum";
import { convertToHHMMSS } from "@antivivi/vrldk";
import { Controller, OnInit } from "@flamework/core";
import { LOCAL_PLAYER } from "shared/constants";
import { ADAPTIVE_TAB_MAIN_WINDOW } from "client/controllers/core/AdaptiveTabController";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import { ASSETS } from "shared/asset/GameAssets";
import Packets from "shared/Packets";

declare global {
    interface Assets {
        MostBalanceStat: Frame & {
            AmountLabel: TextLabel,
            StatLabel: TextLabel;
        };
    }
}

export type StatContainer = Frame & {
    StatLabel: TextLabel;
    AmountLabel: TextLabel;
};

export const STATS_WINDOW = ADAPTIVE_TAB_MAIN_WINDOW.WaitForChild("Stats") as Frame & {
    StatList: ScrollingFrame & {
        Playtime: StatContainer;
        SessionTime: StatContainer;
        LongestSessionTime: StatContainer;
        RawPurifierClicks: StatContainer;
        CurrentPing: StatContainer;
    };
};

/**
 * Controller responsible for managing the stats window UI and updating player statistics.
 *
 * Handles stat display, updates, and integration with UI and data packets.
 */
@Controller()
export default class StatsController implements OnInit {

    /**
     * Refreshes the raw purifier clicks stat label.
     */
    refreshRawPurifierClicks() {
        STATS_WINDOW.StatList.RawPurifierClicks.AmountLabel.Text = tostring(LOCAL_PLAYER.GetAttribute("RawPurifierClicks") as number ?? 0);
    }

    /**
     * Initializes the StatsController, sets up stat observers and populates the stats window.
     */
    onInit() {
        Packets.empirePlaytime.observe((value) => STATS_WINDOW.StatList.Playtime.AmountLabel.Text = convertToHHMMSS(value));
        Packets.sessionTime.observe((value) => STATS_WINDOW.StatList.SessionTime.AmountLabel.Text = convertToHHMMSS(value));
        Packets.longestSessionTime.observe((value) => STATS_WINDOW.StatList.LongestSessionTime.AmountLabel.Text = convertToHHMMSS(value));
        LOCAL_PLAYER.GetAttributeChangedSignal("RawPurifierClicks").Connect(() => this.refreshRawPurifierClicks());
        this.refreshRawPurifierClicks();
        for (const [currency, details] of pairs(CURRENCY_DETAILS)) {
            const mostBalanceStat = ASSETS.MostBalanceStat.Clone();
            mostBalanceStat.StatLabel.Text = `Most ${currency}`;
            mostBalanceStat.Name = currency;
            mostBalanceStat.Visible = false;
            mostBalanceStat.LayoutOrder = 50 + details.layoutOrder;
            mostBalanceStat.Parent = STATS_WINDOW.StatList;
        }
        Packets.mostBalance.observe((value) => {
            for (const [currency, a] of value) {
                const amount = new OnoeNum(a);
                const option = STATS_WINDOW.StatList.FindFirstChild(currency) as StatContainer | undefined;
                if (option !== undefined) {
                    if (amount.lessEquals(0)) {
                        option.Visible = false;
                        continue;
                    }
                    option.Visible = true;
                    option.AmountLabel.Text = CurrencyBundle.getFormatted(currency, amount, true);
                }
            }
        });
    }
}
