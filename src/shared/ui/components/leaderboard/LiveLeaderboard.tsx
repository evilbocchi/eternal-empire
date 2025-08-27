/**
 * @fileoverview Example of using React leaderboard components with live data.
 */

import React from "@rbxts/react";
import Leaderboard from "shared/ui/components/leaderboard/Leaderboard";
import { LeaderboardDataManager } from "shared/ui/components/leaderboard/LeaderboardDataManager";
import { useLeaderboardData } from "shared/ui/components/leaderboard/useLeaderboardData";

interface LiveLeaderboardProps {
    /** The leaderboard data manager instance */
    dataManager: LeaderboardDataManager;
    /** The type of leaderboard to display */
    leaderboardType: LeaderboardType;
    /** Custom title override */
    title?: string;
    /** Custom value label */
    valueLabel?: string;
    /** Maximum entries to show */
    maxEntries?: number;
}

/**
 * Live leaderboard component that automatically updates with server data.
 */
export default function LiveLeaderboard({
    dataManager,
    leaderboardType,
    title,
    valueLabel,
    maxEntries = 100
}: LiveLeaderboardProps) {
    // Use the hook to get live leaderboard data
    const entries = useLeaderboardData(dataManager, leaderboardType);

    return (
        <Leaderboard
            leaderboardType={leaderboardType}
            entries={entries}
            title={title}
            valueLabel={valueLabel}
            maxEntries={maxEntries}
        />
    );
}
