import Signal from "@antivivi/lemon-signal";
import { Controller, OnStart } from "@flamework/core";
import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { LEADERBOARDS } from "shared/constants";
import Packets from "shared/Packets";
import LiveLeaderboard from "shared/ui/components/leaderboard/LiveLeaderboard";

@Controller()
export class LeaderboardController implements OnStart, LeaderboardDataManager {

    private leaderboardData = new Map<LeaderboardType, LeaderboardEntry[]>();
    private leaderboardDataChanged = new Signal<(type: LeaderboardType, entries: LeaderboardEntry[]) => void>();

    getLeaderboardEntries(leaderboardType: LeaderboardType): LeaderboardEntry[] {
        return Packets.leaderboardData.get()?.get(leaderboardType) ?? [];
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
        for (const leaderboard of LEADERBOARDS.GetChildren()) {
            const guiPart = leaderboard.WaitForChild("GuiPart") as BasePart;
            const surfaceGui = new Instance("SurfaceGui");
            surfaceGui.Parent = guiPart;
            task.spawn(() => {
                const root = ReactRoblox.createRoot(surfaceGui);
                root.render(<LiveLeaderboard
                    dataManager={this}
                    leaderboardType={leaderboard.Name as LeaderboardType}
                    part={guiPart}
                />);
            });

        }

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