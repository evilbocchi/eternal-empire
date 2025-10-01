import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import LeaderboardRenderer from "client/components/world/leaderboard/LeaderboardRenderer";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
    },
    () => {
        // NOTE: You need to switch to Viewport mode to see this story in the world
        return <LeaderboardRenderer />;
    },
);
