import { OnStart, Service } from "@flamework/core";
import { DataStoreService, Players, Workspace } from "@rbxts/services";
import { LEADERBOARDS, Leaderboard, UI_ASSETS } from "shared/constants";
import { DataService } from "./serverdata/DataService";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";
import { LeaderstatsService } from "./LeaderstatsService";

export type LbData = {
    id: string;
    name: string;
    amount: number;
}

@Service()
export class LeaderboardService implements OnStart {

    leaderboardStore = DataStoreService.GetDataStore("Leaderboards");
    donatedStore = DataStoreService.GetOrderedDataStore("Donated");

    constructor(private dataService: DataService, private leaderstatsService: LeaderstatsService) {

    }

    getLeaderboardSlot(place: number, name: string, amount: number) {
        const lbSlot = UI_ASSETS.LeaderboardSlot.Clone();
        lbSlot.ServerLabel.Text = name;
        lbSlot.AmountLabel.Text = tostring(InfiniteMath.ConvertFromLeaderboards(amount as number));
        lbSlot.PlaceLabel.Text = tostring(place);
        lbSlot.LayoutOrder = place;
        return lbSlot;
    }

    resetLeaderboard(leaderboard: Leaderboard) {
        for (const l of leaderboard.GuiPart.SurfaceGui.Display.GetChildren()) {
            if (l.Name === "LeaderboardSlot") {
                l.Destroy();
            }
        }
    }

    updateLeaderboardStore(metric: string, name: string, amount: number) {
        const [d] = this.leaderboardStore.GetAsync(metric);
        const key = this.dataService.getEmpireId();
        let datas = (d as Array<LbData> ?? new Array<LbData>).filter((value) => value.id !== key && value.name !== "no name");
        datas.push({
            id: key,
            name: name,
            amount: amount
        });
        datas = datas.sort((a, b) => a.amount > b.amount);
        const newArray = new Array<LbData>();
        let i = 0;
        for (const data of datas) {
            if (i < 100) {
                newArray.push(data);
            }
            else {
                break;
            }
            ++i;
        }
        this.leaderboardStore.SetAsync(metric, newArray);
        return newArray;
    }

    updateLeaderboard(leaderboard: Leaderboard, lbDatas: Array<LbData | undefined>) {
        this.resetLeaderboard(leaderboard);
        let i = 1;
        for (const data of lbDatas) {
            if (data === undefined) {
                continue;
            }
            this.getLeaderboardSlot(i, data.name, data.amount).Parent = leaderboard.GuiPart.SurfaceGui.Display;
            ++i;
        }
    }

    updateLeaderboards() {
        const profile = this.dataService.empireProfile?.Data;
        if (profile === undefined) {
            return;
        }
        const name = profile.name;
        this.updateLeaderboard(LEADERBOARDS.TimePlayed, this.updateLeaderboardStore("TotalTime", name, new InfiniteMath(profile.playtime).ConvertForLeaderboards()));
        this.updateLeaderboard(LEADERBOARDS.Funds, this.updateLeaderboardStore("Funds", name, new InfiniteMath(profile.currencies.Funds).ConvertForLeaderboards()));
        this.updateLeaderboard(LEADERBOARDS.Power, this.updateLeaderboardStore("Power", name, new InfiniteMath(profile.currencies.Power).ConvertForLeaderboards()));
        for (const player of Players.GetPlayers()) {
            this.donatedStore.SetAsync(tostring(player.UserId), 
                new InfiniteMath(this.leaderstatsService.getLeaderstat(player, "Donated") as number | undefined ?? 0).ConvertForLeaderboards());
        }
        this.updateLeaderboard(LEADERBOARDS.Donated, this.donatedStore.GetSortedAsync(false, 100).GetCurrentPage().map((v) => {
            const [success, name] = pcall(() => Players.GetNameFromUserIdAsync(tonumber(v.key) as number));
            if (success !== true) {
                return undefined;
            }
            return { 
                id: v.key, 
                name: (name as string), 
                amount: v.value as number 
            };
        }));
    }

    onStart() {
        task.spawn(() => {
            this.updateLeaderboards();
            while (task.wait(30)) {
                this.updateLeaderboards();
            }
        });
    }
}