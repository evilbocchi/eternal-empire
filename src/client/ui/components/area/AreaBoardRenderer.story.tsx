import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import AreaBoardRenderer from "client/ui/components/area/AreaBoardRenderer";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
    },
    () => {
        return <AreaBoardRenderer />;
    },
);
