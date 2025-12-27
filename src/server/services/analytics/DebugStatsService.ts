/**
 * @fileoverview Broadcasts lightweight server metrics for the client debug overlay.
 */
import { OnInit, OnStart, Service } from "@flamework/core";
import { HttpService, Players, RunService, Workspace } from "@rbxts/services";
import { IS_STUDIO } from "shared/Context";
import Packets from "shared/Packets";
import AvailableEmpire from "shared/data/AvailableEmpire";
import eat from "shared/hamster/eat";

interface RollingHeartbeat {
    samples: number;
    elapsed: number;
}

const INITIAL_STATS = Packets.debugStats.get();

@Service()
export default class DebugStatsService implements OnInit, OnStart {
    private heartbeat: RollingHeartbeat = { samples: 0, elapsed: 0 };
    private readonly jobId = game.JobId;

    onInit() {
        const heartbeatConnection = RunService.Heartbeat.Connect((deltaTime) => {
            this.heartbeat.samples += 1;
            this.heartbeat.elapsed += deltaTime;

            if (this.heartbeat.elapsed < 1) return;

            const serverTps = this.heartbeat.samples / this.heartbeat.elapsed;
            this.heartbeat.samples = 0;
            this.heartbeat.elapsed = 0;

            const entityCount = Workspace.GetDescendants().size();
            const playerCount = Players.GetPlayers().size();
            const uptimeSeconds = Workspace.GetServerTimeNow();
            Packets.debugStats.set({
                serverTps,
                entityCount,
                playerCount,
                uptimeSeconds,
                jobId: this.jobId,
                lastUpdated: DateTime.now().UnixTimestampMillis,
            });
        });

        eat(heartbeatConnection, "Disconnect");

        const pingConnection = Packets.debugPing.fromClient(() => {
            return;
        });
        eat(pingConnection, "Disconnect");
    }

    onStart() {
        Packets.debugStats.set({
            ...INITIAL_STATS,
            jobId: this.jobId,
            uptimeSeconds: Workspace.GetServerTimeNow(),
            playerCount: Players.GetPlayers().size(),
            entityCount: Workspace.GetDescendants().size(),
            lastUpdated: DateTime.now().UnixTimestampMillis,
        });

        if (IS_STUDIO) {
            const remote = new Instance("RemoteEvent");
            remote.Name = "LiveRemote";
            remote.Parent = Workspace;
            eat(remote, "Destroy");

            remote.OnServerEvent.Connect((_, url) => {
                let player: Player | undefined;
                for (const p of Players.GetPlayers()) {
                    player = p;
                    break;
                }

                const save = {
                    player: player?.Name ?? "Unknown",
                    empireData: _G.empireData,
                    playerData: player ? AvailableEmpire.dataPerPlayer.get(player.UserId) : undefined,
                };

                HttpService.PostAsync(
                    url as string,
                    HttpService.JSONEncode({ save }),
                    Enum.HttpContentType.ApplicationJson,
                );
            });
        }
    }
}
