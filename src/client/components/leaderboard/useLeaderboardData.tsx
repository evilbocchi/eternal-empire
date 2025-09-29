/**
 * @fileoverview React hook for consuming leaderboard data.
 */

import { useEffect, useState } from "@rbxts/react";
import { LeaderboardEntry, LeaderboardType } from "client/components/leaderboard/Leaderboard";
import { LeaderboardDataManager } from "client/components/leaderboard/LiveLeaderboard";

/**
 * React hook to subscribe to leaderboard data updates.
 * @param dataManager The leaderboard data manager instance
 * @param leaderboardType The leaderboard type to subscribe to
 * @returns Current leaderboard entries
 */
export function useLeaderboardData(
    dataManager: LeaderboardDataManager,
    leaderboardType: LeaderboardType,
): LeaderboardEntry[] {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

    useEffect(() => {
        // Get initial data
        setEntries(dataManager.getLeaderboardEntries(leaderboardType));

        // Subscribe to updates
        const unsubscribe = dataManager.onLeaderboardUpdate(leaderboardType, (newEntries) => {
            setEntries(newEntries);
        });

        // Cleanup subscription
        return unsubscribe;
    }, [dataManager, leaderboardType]);

    return entries;
}
