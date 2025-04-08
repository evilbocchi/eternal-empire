import { OnoeNum } from "@antivivi/serikanum";
import { OnStart, Service } from "@flamework/core";
import { DataStoreService, Players, RunService } from "@rbxts/services";
import Sandbox from "shared/Sandbox";
import { LEADERBOARDS, getNameFromUserId } from "shared/constants";
import { ASSETS } from "shared/GameAssets";
import { CURRENCIES } from "shared/currency/CurrencyDetails";
import { LeaderstatsService } from "./LeaderstatsService";
import { DataService } from "./serverdata/DataService";

declare global {
    type LeaderboardSlot = Frame & {
        AmountLabel: TextLabel;
        PlaceLabel: TextLabel;
        ServerLabel: TextLabel;
    };

    type Leaderboard = Model & {
        GuiPart: Part & {
            SurfaceGui: SurfaceGui & {
                Display: ScrollingFrame;
            };
        };
    };

    interface Assets {
        LeaderboardSlot: LeaderboardSlot;
    }
}

@Service()
export class LeaderboardService implements OnStart {

    totalTimeStore = DataStoreService.GetOrderedDataStore("TotalTime1");
    donatedStore = DataStoreService.GetOrderedDataStore("Donated");
    banned = [1900444407];
    debug = false;
    flushed = new Set<OrderedDataStore>();

    constructor(private dataService: DataService, private leaderstatsService: LeaderstatsService) {

    }

    getLeaderboardSlot(place: number, name: string, amount: number) {
        const lbSlot = ASSETS.LeaderboardSlot.Clone();
        lbSlot.ServerLabel.Text = name;
        lbSlot.AmountLabel.Text = tostring(OnoeNum.fromSingle(amount as number));
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

    deleteEntry(store: OrderedDataStore, name?: string) {
        if (!this.flushed.has(store)) {
            task.spawn(() => {
                for (const prevName of this.dataService.empireData.previousNames) {
                    store.RemoveAsync(prevName);
                }
            });
            this.flushed.add(store);
            return;
        }

        if (name !== undefined)
            store.RemoveAsync(name);
    }

    updateLeaderboardStore(store: OrderedDataStore, name?: string, amount?: number) {
        if (name !== undefined && (!RunService.IsStudio() || this.debug === true)) {
            if (amount === undefined)
                store.RemoveAsync(name);
            else
                store.SetAsync(name, amount);
        }
        const data = store.GetSortedAsync(false, 100);
        return data.GetCurrentPage();
    }

    updateLeaderboard(leaderboard: Leaderboard, lbDatas: { key: string, value: unknown; }[]) {
        this.resetLeaderboard(leaderboard);
        let i = 1;
        for (const data of lbDatas) {
            if (data === undefined) {
                continue;
            }
            this.getLeaderboardSlot(i, data.key, data.value as number).Parent = leaderboard.GuiPart.SurfaceGui.Display;
            ++i;
            if (this.debug === true) {
                print(leaderboard.Name, data.key, data.value);
            }
        }
    }

    updateLeaderboards(deleteEntries?: string) {
        const profile = this.dataService.empireData;
        if (this.banned.includes(profile.owner)) {
            return;
        }
        const name = profile.name;
        const isDeleting = deleteEntries !== undefined;

        if (isDeleting) {
            this.deleteEntry(this.totalTimeStore, deleteEntries);
        }
        this.updateLeaderboard(LEADERBOARDS.TimePlayed,
            this.updateLeaderboardStore(this.totalTimeStore, name, new OnoeNum(profile.playtime).toSingle()));


        for (const currency of CURRENCIES) {
            const lb = LEADERBOARDS.FindFirstChild(currency) as Leaderboard | undefined;
            if (lb === undefined)
                continue;

            let mostCurrencies = profile.mostCurrencies.get(currency);
            let amt = mostCurrencies === undefined ? undefined : new OnoeNum(mostCurrencies).toSingle();
            const store = DataStoreService.GetOrderedDataStore(lb.Name + "1");

            if (isDeleting)
                this.deleteEntry(store, deleteEntries);
            this.updateLeaderboard(lb, this.updateLeaderboardStore(store, name, amt));
        }

        for (const player of Players.GetPlayers()) {
            this.donatedStore.SetAsync(tostring(player.UserId),
                new OnoeNum(this.leaderstatsService.getLeaderstat(player, "Donated") as number | undefined ?? 0).toSingle());
        }
        this.updateLeaderboard(LEADERBOARDS.Donated, this.donatedStore.GetSortedAsync(false, 100).GetCurrentPage()
            .map((value) => {
                return { key: getNameFromUserId(tonumber(value.key) ?? 0), value: value.value };
            }));
    }

    onStart() {
        if (Sandbox.getEnabled())
            return;

        task.spawn(() => {
            this.updateLeaderboards();
            while (task.wait(180)) {
                this.updateLeaderboards();
            }
        });
    }
}