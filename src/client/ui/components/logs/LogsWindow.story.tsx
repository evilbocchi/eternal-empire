import { OnoeNum } from "@antivivi/serikanum";
import React, { useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import LogsWindow from "client/ui/components/logs/LogsWindow";
import StoryMocking from "client/ui/components/StoryMocking";
import { useSingleDocumentVisibility } from "client/ui/hooks/useVisibility";
import Packets from "shared/Packets";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            visible: true,
            logCount: 45,
            includeRealTimeUpdates: true,
        },
    },
    (props) => {
        StoryMocking.mockData();

        useSingleDocumentVisibility("Logs", props.controls.visible);

        // Mock log data with various types
        const mockLogs: Log[] = [];
        const currentTime = os.time();

        // Create diverse mock logs to showcase all log types
        const logTypes = [
            {
                type: "Purchase",
                player: 123456789,
                items: ["TheFirstDropper", "Copper"],
                time: currentTime - 3600,
            },
            {
                type: "Place",
                player: 987654321,
                item: "TheFirstDropper",
                x: 10,
                y: 5,
                z: -3,
                time: currentTime - 3200,
            },
            {
                type: "Unplace",
                player: 123456789,
                item: "Copper",
                x: 15,
                y: 8,
                z: 2,
                time: currentTime - 2800,
            },
            {
                type: "Upgrade",
                player: 555666777,
                upgrade: "SkilledMining",
                amount: 5,
                time: currentTime - 2400,
            },
            {
                type: "Respec",
                player: 123456789,
                time: currentTime - 2000,
            },
            {
                type: "Reset",
                player: 987654321,
                layer: "Prestige",
                currency: "Funds",
                infAmount: OnoeNum.fromSerika(1, 15).revert(),
                time: currentTime - 1600,
            },
            {
                type: "Bomb",
                player: 555666777,
                currency: "Funds Bomb",
                time: currentTime - 1200,
            },
            {
                type: "SetupSave",
                player: 123456789,
                area: "Classic",
                time: currentTime - 800,
            },
            {
                type: "SetupLoad",
                player: 987654321,
                area: "Classic",
                time: currentTime - 400,
            },
        ];

        // Generate the requested number of logs by repeating and varying the base types
        for (let i = 0; i < props.controls.logCount; i++) {
            const baseLog = logTypes[i % logTypes.size()];
            const timeVariation = math.random(-100, 100);
            mockLogs.push({
                ...baseLog,
                time: baseLog.time + timeVariation + i * 10,
                player: baseLog.player + (i % 3), // Vary player IDs slightly
                ...(baseLog.x !== undefined && { x: baseLog.x + (i % 5) }),
                ...(baseLog.y !== undefined && { y: baseLog.y + (i % 3) }),
                ...(baseLog.z !== undefined && { z: baseLog.z + (i % 4) }),
            } as Log);
        }

        // Sort logs by time (newest first)
        mockLogs.sort((a, b) => b.time > a.time);

        // Mock the getLogs packet to return our mock data
        Packets.getLogs.toServer = () => mockLogs;

        // Mock real-time log updates if enabled
        useEffect(() => {
            if (!props.controls.includeRealTimeUpdates) return;

            let active = true;
            task.spawn(() => {
                while (active) {
                    task.wait(5); // Add a new log every 5 seconds

                    if (!active) break;

                    const newLogTypes = [
                        {
                            type: "Purchase",
                            player: 111222333 + math.random(0, 999),
                            items: ["TheFirstDropper"],
                            time: os.time(),
                        },
                        {
                            type: "Place",
                            player: 444555666 + math.random(0, 999),
                            item: "Copper",
                            x: math.random(-20, 20),
                            y: math.random(0, 10),
                            z: math.random(-20, 20),
                            time: os.time(),
                        },
                        {
                            type: "Reset",
                            player: 777888999 + math.random(0, 999),
                            layer: "Prestige",
                            currency: "Funds",
                            infAmount: OnoeNum.fromSerika(1, math.random(10, 20)).revert(),
                            time: os.time(),
                        },
                    ];

                    const randomLog = newLogTypes[math.random(0, newLogTypes.size() - 1)] as Log;
                    Packets.logAdded.toAllClients(randomLog);

                    // Simulate adding a new log (in a real scenario, this would trigger via server)
                    print(`New log would be added: ${randomLog.type} by player ${randomLog.player}`);
                }
            });

            return () => {
                active = false;
            };
        }, [props.controls.includeRealTimeUpdates]);

        return <LogsWindow />;
    },
);
