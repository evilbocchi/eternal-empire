import Signal from "@antivivi/lemon-signal";
import { Controller, OnStart } from "@flamework/core";
import Packets from "shared/Packets";
import { LeaderboardDataManager } from "shared/ui/components/leaderboard/LeaderboardDataManager";

@Controller()
export class LeaderboardController implements OnStart, LeaderboardDataManager {

    private leaderboardData = new Map<LeaderboardType, LeaderboardEntry[]>();
    private leaderboardDataChanged = new Signal<(type: LeaderboardType, entries: LeaderboardEntry[]) => void>();

    getLeaderboardEntries(leaderboardType: LeaderboardType): LeaderboardEntry[] {
        return Packets.leaderboardData.get()?.get(leaderboardType) || [];
    }

    onLeaderboardUpdate(leaderboardType: LeaderboardType, callback: (entries: LeaderboardEntry[]) => void): () => void {
        const connection = this.leaderboardDataChanged.connect((changedType, entries) => {
            if (leaderboardType === changedType) {
                callback(entries);
            }
        });
        return () => {
            connection.disconnect();
        };
    }

    onStart() {
        Packets.leaderboardData.observe((leaderboardData) => {
            for (const [type, entries] of leaderboardData) {
                if (entries !== this.leaderboardData.get(type)) {
                    this.leaderboardDataChanged.fire(type, entries);
                }
            }
            this.leaderboardData = leaderboardData;
        });
    }
}