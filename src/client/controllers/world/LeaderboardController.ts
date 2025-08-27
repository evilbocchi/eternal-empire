import { Controller, OnStart } from "@flamework/core";
import Packets from "shared/Packets";
import { LeaderboardDataManager } from "shared/ui/components/leaderboard/LeaderboardDataManager";

@Controller()
export class LeaderboardController implements OnStart, LeaderboardDataManager {

    getLeaderboardEntries(type: LeaderboardType): LeaderboardEntry[] {
        return Packets.getLeaderboardEntries.(type);
    }

    updateLeaderboardData(type: LeaderboardType, entries: LeaderboardEntry[]): void {
        throw new Error("Method not implemented.");
    }

    onLeaderboardUpdate(type: LeaderboardType, callback: (entries: LeaderboardEntry[]) => void): () => void {
        throw new Error("Method not implemented.");
    }

    getAvailableTypes(): LeaderboardType[] {
        throw new Error("Method not implemented.");
    }

    onStart() {

    }
}