import { Controller, OnInit } from "@flamework/core";
import { LOCAL_PLAYER, STATS_WINDOW, StatContainer } from "client/constants";
import Price from "shared/Price";
import { ASSETS } from "shared/constants";
import { Fletchette } from "@antivivi/fletchette";
import { OnoeNum } from "@antivivi/serikanum";
import { convertToHHMMSS } from "shared/utils/vrldk/NumberAbbreviations";

@Controller()
export class StatsController implements OnInit {

    refreshRawPurifierClicks() {
        STATS_WINDOW.StatList.RawPurifierClicks.AmountLabel.Text = tostring(LOCAL_PLAYER.GetAttribute("RawPurifierClicks") as number ?? 0);
    }

    onInit() {
        const CurrencyCanister = Fletchette.getCanister("CurrencyCanister");
        const PlaytimeCanister = Fletchette.getCanister("PlaytimeCanister");
        PlaytimeCanister.empirePlaytime.observe((value) => STATS_WINDOW.StatList.Playtime.AmountLabel.Text = convertToHHMMSS(value));
        PlaytimeCanister.sessionTime.observe((value) => STATS_WINDOW.StatList.SessionTime.AmountLabel.Text = convertToHHMMSS(value));
        PlaytimeCanister.longestSessionTime.observe((value) => STATS_WINDOW.StatList.LongestSessionTime.AmountLabel.Text = convertToHHMMSS(value));
        LOCAL_PLAYER.GetAttributeChangedSignal("RawPurifierClicks").Connect(() => this.refreshRawPurifierClicks());
        this.refreshRawPurifierClicks();
        for (const [currency, details] of pairs(Price.DETAILS_PER_CURRENCY)) {
            const mostBalanceStat = ASSETS.MostBalanceStat.Clone();
            mostBalanceStat.StatLabel.Text = `Most ${currency}`;
            mostBalanceStat.Name = currency;
            mostBalanceStat.Visible = false;
            mostBalanceStat.LayoutOrder = 50 + details.layoutOrder;
            mostBalanceStat.Parent = STATS_WINDOW.StatList;
        }
        CurrencyCanister.mostBalance.observe((value) => {
            for (const [currency, a] of value) {
                const amount = new OnoeNum(a);
                const option = STATS_WINDOW.StatList.FindFirstChild(currency) as StatContainer | undefined;
                if (option !== undefined) {
                    if (amount.lessEquals(0)) {
                        option.Visible = false;
                        continue;
                    }
                    option.Visible = true;
                    option.AmountLabel.Text = Price.getFormatted(currency, amount, true);
                }
            }
        });
    }
}
