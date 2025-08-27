/**
 * @fileoverview React-compatible interface for leaderboard data management.
 */

/**
 * Interface for managing leaderboard data that can be consumed by React components.
 */
export interface LeaderboardDataManager {
    /** Get entries for a specific leaderboard type */
    getLeaderboardEntries(type: LeaderboardType): LeaderboardEntry[];

    /** Update a leaderboard with new data */
    updateLeaderboardData(type: LeaderboardType, entries: LeaderboardEntry[]): void;

    /** Subscribe to leaderboard updates */
    onLeaderboardUpdate(type: LeaderboardType, callback: (entries: LeaderboardEntry[]) => void): () => void;

    /** Get all available leaderboard types */
    getAvailableTypes(): LeaderboardType[];
}

/**
 * Event interface for leaderboard updates.
 */
export interface LeaderboardUpdateEvent {
    type: LeaderboardType;
    entries: LeaderboardEntry[];
}
