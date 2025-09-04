import React, { StrictMode } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import PositionWindow from "client/ui/components/position/PositionWindow";
import { TooltipDisplay } from "client/ui/components/tooltip/TooltipManager";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            visible: true,
        },
    },
    (props) => {
        return (
            <StrictMode>
                <PositionWindow position={new Vector3(100, 50, 200)} {...props.controls} />
                <TooltipDisplay />
            </StrictMode>
        );
    },
);
