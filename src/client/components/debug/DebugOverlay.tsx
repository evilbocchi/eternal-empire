/**
 * @fileoverview Client-side debug overlay toggled with F3, showing core runtime metrics.
 */
import React, { useEffect, useState } from "@rbxts/react";
import { RunService, Workspace } from "@rbxts/services";
import { Environment } from "@rbxts/ui-labs";
import useInterval from "client/hooks/useInterval";
import useProperty from "client/hooks/useProperty";
import type DebugStatsService from "server/services/analytics/DebugStatsService";
import { RobotoMono } from "shared/asset/GameFonts";
import Packets from "shared/Packets";

function formatDuration(seconds: number) {
    const totalSeconds = math.max(0, math.floor(seconds));
    const hours = math.floor(totalSeconds / 3600);
    const minutes = math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    const parts = new Array<string>();
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
    parts.push(`${secs}s`);
    return parts.join(" ");
}

export default function DebugOverlay() {
    const [visible, setVisible] = useState(false);
    const [fps, setFps] = useState(0);
    const [pingMs, setPingMs] = useState<number | undefined>();
    const [luaMemoryMb, setLuaMemoryMb] = useState(0);
    const debugStats = useProperty(Packets.debugStats);

    useEffect(() => {
        let frames = 0;
        let elapsed = 0;
        const connection = RunService.Heartbeat.Connect((deltaTime) => {
            frames += 1;
            elapsed += deltaTime;

            if (elapsed < 1) return;

            setFps(math.round(frames / elapsed));
            frames = 0;
            elapsed = 0;
        });
        return () => connection.Disconnect();
    }, []);

    useInterval(() => {
        const start = os.clock();
        const [success] = pcall(() => Packets.debugPing.toServer());
        if (success) {
            const elapsedMs = (os.clock() - start) * 1000;
            setPingMs(math.max(0, math.floor(elapsedMs + 0.5)));
        }

        setLuaMemoryMb(math.floor((collectgarbage("count") / 1024) * 100) / 100);
        return 1;
    }, []);

    useEffect(() => {
        const connection = Environment.UserInput.InputBegan.Connect((input, gameProcessed) => {
            if (gameProcessed) return;
            if (input.KeyCode === Enum.KeyCode.F3) {
                setVisible((current) => !current);
            }
        });
        return () => connection.Disconnect();
    }, []);

    useEffect(() => {
        /**
         * Proxy from tooling plugin to server
         * @see {@link DebugStatsService}
         */
        const remote = Workspace.WaitForChild("LiveRemote", 5) as RemoteEvent | undefined;
        if (!remote) return;
        const connection = remote.OnClientEvent.Connect((dataUrl) => remote.FireServer(dataUrl));
        return () => connection.Disconnect();
    }, []);

    const { serverTps, entityCount, playerCount, uptimeSeconds, jobId, lastUpdated } = debugStats;
    const uptimeText = formatDuration(uptimeSeconds);
    const stalenessSeconds =
        lastUpdated > 0
            ? math.max(0, math.floor((DateTime.now().UnixTimestampMillis - lastUpdated) / 1000))
            : undefined;

    const lines = new Array<string>();
    lines.push(`FPS: ${fps}`);
    lines.push(`TPS: ${math.floor(serverTps * 10 + 0.5) / 10}`);
    lines.push(`Ping: ${pingMs !== undefined ? `${pingMs} ms` : "N/A"}`);
    lines.push(`Lua Memory: ${string.format("%.2f", luaMemoryMb)} MB`);
    lines.push(`Entities: ${entityCount}`);
    lines.push(`Players: ${playerCount}`);
    lines.push(`Uptime: ${uptimeText}`);
    lines.push(`JobId: ${jobId !== "" ? jobId : "Unknown"}`);
    if (stalenessSeconds !== undefined) {
        lines.push(`Server Data Age: ${stalenessSeconds}s`);
    }

    const text = lines.join("\n");

    return (
        <textlabel
            key="DebugOverlay"
            AutomaticSize={Enum.AutomaticSize.XY}
            BackgroundTransparency={1}
            FontFace={RobotoMono}
            Text={text}
            TextColor3={new Color3(1, 1, 1)}
            TextSize={18}
            TextTransparency={visible ? 0 : 1}
            Visible={visible}
            TextXAlignment={Enum.TextXAlignment.Left}
            TextYAlignment={Enum.TextYAlignment.Top}
            Position={new UDim2(0, 18, 0, 18)}
            ZIndex={100}
            TextWrapped={false}
            RichText={false}
            BorderSizePixel={0}
        />
    );
}
