import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import ResetBoardRenderer from "client/ui/components/reset/ResetBoardRenderer";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
    },
    () => {
        return <ResetBoardRenderer />;
    },
);
