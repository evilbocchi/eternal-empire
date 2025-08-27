/**
 * @fileoverview React hook for consuming leaderboard data.
 */

import React from "@rbxts/react";

/**
 * React hook to subscribe to leaderboard data updates.
 * @param dataManager The leaderboard data manager instance
 * @param leaderboardType The leaderboard type to subscribe to
 * @returns Current leaderboard entries
 */
export function useLeaderboardData(dataManager: LeaderboardDataManager, leaderboardType: LeaderboardType): LeaderboardEntry[] {
    const [entries, setEntries] = React.useState<LeaderboardEntry[]>([]);

    React.useEffect(() => {
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