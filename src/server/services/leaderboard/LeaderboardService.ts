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
import { CollectionService, DataStoreService, Players } from "@rbxts/services";
import DataService from "server/services/data/DataService";
import LeaderstatsService from "server/services/leaderboard/LeaderstatsService";
import { getNameFromUserId } from "shared/constants";
import { IS_STUDIO } from "shared/Context";
import { CURRENCIES, CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import Packets from "shared/Packets";
import Sandbox from "shared/Sandbox";

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

    /** Cached leaderboard data for React components */
    private readonly leaderboardData = new Map<LeaderboardType, LeaderboardEntry[]>();

    constructor(
        private readonly dataService: DataService,
        private readonly leaderstatsService: LeaderstatsService,
    ) {}

    /**
     * Converts DataStore entries to LeaderboardEntry format.
     * @param lbDatas Raw leaderboard data from DataStore
     * @returns Formatted leaderboard entries
     */
    private convertToLeaderboardEntries(lbDatas: { key: string; value: unknown }[]): LeaderboardEntry[] {
        const entries: LeaderboardEntry[] = [];
        for (let i = 0; i < lbDatas.size(); i++) {
            const data = lbDatas[i];
            if (data !== undefined) {
                entries.push({
                    place: i + 1,
                    name: data.key,
                    amount: data.value as number,
                });
            }
        }
        return entries;
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

        if (name !== undefined) store.RemoveAsync(name);
    }

    /**
     * Updates a leaderboard DataStore with a new value, or removes it if amount is undefined.
     * @param store The OrderedDataStore
     * @param name The name to update
     * @param amount The value to set (optional)
     * @returns The current page of sorted leaderboard data
     */
    private updateLeaderboardStore(store: OrderedDataStore, name?: string, amount?: number) {
        if (name !== undefined && (!IS_STUDIO || this.debug === true)) {
            if (amount === undefined) store.RemoveAsync(name);
            else store.SetAsync(name, amount);
        }
        const data = store.GetSortedAsync(false, 100);
        return data.GetCurrentPage();
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

        if (deleteEntries) {
            this.deleteEntry(this.totalTimeStore, deleteEntries);
            this.deleteEntry(this.levelStore, deleteEntries);
        }
        this.leaderboardData.set(
            "TimePlayed",
            this.convertToLeaderboardEntries(
                this.updateLeaderboardStore(this.totalTimeStore, name, new OnoeNum(profile.playtime).toSingle()),
            ),
        );
        this.leaderboardData.set(
            "Level",
            this.convertToLeaderboardEntries(
                this.updateLeaderboardStore(this.levelStore, name, new OnoeNum(profile.level).toSingle()),
            ),
        );

        for (const lb of CollectionService.GetTagged("Leaderboard")) {
            const currency = lb.Name as Currency;
            if (CURRENCY_DETAILS[currency] === undefined) continue;

            const mostCurrencies = profile.mostCurrencies.get(currency);
            const amt = mostCurrencies === undefined ? undefined : new OnoeNum(mostCurrencies).toSingle();
            const store = DataStoreService.GetOrderedDataStore(currency);

            if (deleteEntries) this.deleteEntry(store, deleteEntries);
            this.leaderboardData.set(
                currency,
                this.convertToLeaderboardEntries(this.updateLeaderboardStore(store, name, amt)),
            );
        }

        for (const player of Players.GetPlayers()) {
            this.donatedStore.SetAsync(
                tostring(player.UserId),
                new OnoeNum(
                    (this.leaderstatsService.getLeaderstat(player, "Donated") as number | undefined) ?? 0,
                ).toSingle(),
            );
        }
        this.leaderboardData.set(
            "Donated",
            this.convertToLeaderboardEntries(
                this.donatedStore
                    .GetSortedAsync(false, 100)
                    .GetCurrentPage()
                    .map((value) => {
                        return { key: getNameFromUserId(tonumber(value.key) ?? 0), value: value.value };
                    }),
            ),
        );
        Packets.leaderboardData.set(this.leaderboardData);
    }

    /**
     * Starts the leaderboard update loop and initializes leaderboards.
     */
    onStart() {
        if (Sandbox.getEnabled()) return;

        task.spawn(() => {
            this.updateLeaderboards();
            while (task.wait(180)) {
                this.updateLeaderboards();
            }
        });
    }
}
