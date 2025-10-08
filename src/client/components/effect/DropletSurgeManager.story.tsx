import React, { StrictMode } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import ClickSparkManager from "client/components/effect/ClickSparkManager";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
    },
    () => {
        return (
            <StrictMode>
                <ClickSparkManager />
            </StrictMode>
        );
    },
);
