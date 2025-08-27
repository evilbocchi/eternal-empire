/**
 * @fileoverview React-compatible interface for leaderboard data management.
 */

/**
 * Interface for managing leaderboard data that can be consumed by React components.
 */
export interface LeaderboardDataManager {
    /** Get entries for a specific leaderboard type */
    getLeaderboardEntries(leaderboardType: LeaderboardType): LeaderboardEntry[];

    /** Subscribe to leaderboard updates */
    onLeaderboardUpdate(leaderboardType: LeaderboardType, callback: (entries: LeaderboardEntry[]) => void): () => void;
}

/**
 * Event interface for leaderboard updates.
 */
export interface LeaderboardUpdateEvent {
    type: LeaderboardType;
    entries: LeaderboardEntry[];
}
