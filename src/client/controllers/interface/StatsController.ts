import { Controller, OnInit } from "@flamework/core";
import { STATS_WINDOW } from "client/constants";
import { Fletchette } from "shared/utils/fletchette";
import { convertToHHMMSS } from "shared/utils/vrldk/NumberAbbreviations";

@Controller()
export class StatsController implements OnInit {

    refreshPlaytime(playtime: number) {
        STATS_WINDOW.StatList.Playtime.AmountLabel.Text = convertToHHMMSS(playtime);
    }

    refreshSessionTime(sessionTime: number) {
        STATS_WINDOW.StatList.SessionTime.AmountLabel.Text = convertToHHMMSS(sessionTime);
    }

    refreshLongestSessionTime(lst: number) {
        STATS_WINDOW.StatList.LongestSessionTime.AmountLabel.Text = convertToHHMMSS(lst);
    }

    onInit() {
        const PlaytimeCanister = Fletchette.getCanister("PlaytimeCanister");
        PlaytimeCanister.empirePlaytime.observe((value) => this.refreshPlaytime(value));
        PlaytimeCanister.sessionTime.observe((value) => this.refreshSessionTime(value));
        PlaytimeCanister.longestSessionTime.observe((value) => this.refreshLongestSessionTime(value));
    }
}
