import React, { StrictMode } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import SkillificationBoard from "client/ui/components/reset/SkillificationBoard";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
    },
    () => {
        return (
            <StrictMode>
                <SkillificationBoard />
            </StrictMode>
        );
    },
);
