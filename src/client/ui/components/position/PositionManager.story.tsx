import React, { StrictMode } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import PositionManager from "client/ui/components/position/PositionManager";
import TooltipWindow from "client/ui/components/tooltip/TooltipWindow";

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
                <PositionManager {...props.controls} />
                <TooltipWindow />
            </StrictMode>
        );
    },
);
