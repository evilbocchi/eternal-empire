/**
 * @fileoverview Manages all leaderboard logic and display in the game.
 *
 * This service handles:
 * - Updating and displaying leaderboards for time played, donations, and all currencies
 * - Interfacing with DataStores for persistent leaderboard data
 * - Resetting and updating leaderboard UI elements
 * - Filtering banned users and handling debug/test modes
 *
 * @since 1.0.0
 */

import { OnoeNum } from "@antivivi/serikanum";
import { OnStart, Service } from "@flamework/core";
import { DataStoreService, Players, RunService } from "@rbxts/services";
import LeaderstatsService from "server/services/leaderboard/LeaderstatsService";
import DataService from "server/services/data/DataService";
import { ASSETS } from "shared/asset/GameAssets";
import Sandbox from "shared/Sandbox";
import { LEADERBOARDS, getNameFromUserId } from "shared/constants";
import { CURRENCIES } from "shared/currency/CurrencyDetails";

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

/**
 * Service that manages all leaderboard logic, including updating DataStores and UI.
 */
@Service()
export class LeaderboardService implements OnStart {

    /** OrderedDataStore for total time leaderboard. */
    totalTimeStore = DataStoreService.GetOrderedDataStore("TotalTime");

    /** OrderedDataStore for donations leaderboard. */
    donatedStore = DataStoreService.GetOrderedDataStore("Donated");

    /** OrderedDataStore for level leaderboard. */
    levelStore = DataStoreService.GetOrderedDataStore("Level");

    /** List of banned user IDs (excluded from leaderboards). */
    banned = [1900444407];

    /** Debug flag for verbose output and studio testing. */
    debug = false;

    /** Set of DataStores that have been flushed (for deletion). */
    flushed = new Set<OrderedDataStore>();

    constructor(private dataService: DataService,
        private leaderstatsService: LeaderstatsService) {
    }

    /**
     * Creates a leaderboard slot UI element for a given place, name, and amount.
     * @param place The leaderboard position
     * @param name The player's name
     * @param amount The leaderboard value
     * @returns The leaderboard slot UI element
     */
    getLeaderboardSlot(place: number, name: string, amount: number) {
        const lbSlot = ASSETS.LeaderboardSlot.Clone();
        lbSlot.ServerLabel.Text = name;
        lbSlot.AmountLabel.Text = tostring(OnoeNum.fromSingle(amount as number));
        lbSlot.PlaceLabel.Text = tostring(place);
        lbSlot.LayoutOrder = place;
        return lbSlot;
    }

    /**
     * Removes all leaderboard slot UI elements from a leaderboard.
     * @param leaderboard The leaderboard model
     */
    resetLeaderboard(leaderboard: Leaderboard) {
        for (const l of leaderboard.GuiPart.SurfaceGui.Display.GetChildren()) {
            if (l.Name === "LeaderboardSlot") {
                l.Destroy();
            }
        }
    }

    /**
     * Deletes an entry from a DataStore, optionally by name.
     * @param store The OrderedDataStore
     * @param name The name to delete (optional)
     */
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

    /**
     * Updates a leaderboard DataStore with a new value, or removes it if amount is undefined.
     * @param store The OrderedDataStore
     * @param name The name to update
     * @param amount The value to set (optional)
     * @returns The current page of sorted leaderboard data
     */
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

    /**
     * Updates the leaderboard UI with new data.
     * @param leaderboard The leaderboard model
     * @param lbDatas The leaderboard data array
     */
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

    /**
     * Updates all leaderboards, optionally deleting entries.
     * @param deleteEntries The name to delete (optional)
     */
    updateLeaderboards(deleteEntries?: string) {
        const profile = this.dataService.empireData;
        if (this.banned.includes(profile.owner)) {
            return;
        }
        const name = profile.name;
        const isDeleting = deleteEntries !== undefined;

        if (isDeleting) {
            this.deleteEntry(this.totalTimeStore, deleteEntries);
            this.deleteEntry(this.levelStore, deleteEntries);
        }
        this.updateLeaderboard(LEADERBOARDS.TimePlayed,
            this.updateLeaderboardStore(this.totalTimeStore, name, new OnoeNum(profile.playtime).toSingle()));

        this.updateLeaderboard(LEADERBOARDS.Level,
            this.updateLeaderboardStore(this.levelStore, name, profile.level));


        for (const currency of CURRENCIES) {
            const lb = LEADERBOARDS.FindFirstChild(currency) as Leaderboard | undefined;
            if (lb === undefined)
                continue;

            let mostCurrencies = profile.mostCurrencies.get(currency);
            let amt = mostCurrencies === undefined ? undefined : new OnoeNum(mostCurrencies).toSingle();
            const store = DataStoreService.GetOrderedDataStore(lb.Name);

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

    /**
     * Starts the leaderboard update loop and initializes leaderboards.
     */
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