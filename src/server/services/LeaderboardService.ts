import { OnStart, Service } from "@flamework/core";
import { DataStoreService, Players } from "@rbxts/services";
import { LEADERBOARDS, Leaderboard, UI_ASSETS, getNameFromUserId } from "shared/constants";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";
import { LeaderstatsService } from "./LeaderstatsService";
import { DataService } from "./serverdata/DataService";

@Service()
export class LeaderboardService implements OnStart {

    fundsStore = DataStoreService.GetOrderedDataStore("Funds1");
    powerStore = DataStoreService.GetOrderedDataStore("Power1");
    skillStore = DataStoreService.GetOrderedDataStore("Skill");
    totalTimeStore = DataStoreService.GetOrderedDataStore("TotalTime1");
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

    updateLeaderboardStore(store: OrderedDataStore, name: string, amount: number) {
        if (name !== "no name" && name !== undefined) {
            store.SetAsync(name, amount);
        }
        const data = store.GetSortedAsync(false, 100);
        return data.GetCurrentPage();
    }

    updateLeaderboard(leaderboard: Leaderboard, lbDatas: { key: string, value: unknown }[]) {
        this.resetLeaderboard(leaderboard);
        let i = 1;
        for (const data of lbDatas) {
            if (data === undefined) {
                continue;
            }
            this.getLeaderboardSlot(i, data.key, data.value as number).Parent = leaderboard.GuiPart.SurfaceGui.Display;
            ++i;
        }
    }

    updateLeaderboards() {
        const profile = this.dataService.empireProfile?.Data;
        if (profile === undefined) {
            return;
        }
        const name = profile.name;
        this.updateLeaderboard(LEADERBOARDS.TimePlayed, 
            this.updateLeaderboardStore(this.totalTimeStore, name, new InfiniteMath(profile.playtime).ConvertForLeaderboards()));
        const funds = profile.mostCurrencies.get("Funds");
        if (funds !== undefined) {
            this.updateLeaderboard(LEADERBOARDS.Funds, 
                this.updateLeaderboardStore(this.fundsStore, name, new InfiniteMath(funds).ConvertForLeaderboards()));
        }
        const power = profile.mostCurrencies.get("Power");
        if (power !== undefined) {
            this.updateLeaderboard(LEADERBOARDS.Power, 
                this.updateLeaderboardStore(this.powerStore, name, new InfiniteMath(power).ConvertForLeaderboards()));
        }
        const skill = profile.mostCurrencies.get("Skill");
        if (skill !== undefined) {
            this.updateLeaderboard(LEADERBOARDS.Skill, 
                this.updateLeaderboardStore(this.skillStore, name, new InfiniteMath(skill).ConvertForLeaderboards()));
        }
        for (const player of Players.GetPlayers()) {
            this.donatedStore.SetAsync(tostring(player.UserId), 
                new InfiniteMath(this.leaderstatsService.getLeaderstat(player, "Donated") as number | undefined ?? 0).ConvertForLeaderboards());
        }
        this.updateLeaderboard(LEADERBOARDS.Donated, this.donatedStore.GetSortedAsync(false, 100).GetCurrentPage()
            .map((value) => {
                return { key: getNameFromUserId(tonumber(value.key) ?? 0), value: value.value };
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