import React, { StrictMode } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import PositionManager from "client/components/position/PositionManager";
import TooltipWindow from "client/components/tooltip/TooltipWindow";
import useVisibility from "client/hooks/useVisibility";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            visible: true,
        },
    },
    (props) => {
        useVisibility("Position", props.controls.visible);

        return (
            <StrictMode>
                <PositionManager {...props.controls} />
                <TooltipWindow />
            </StrictMode>
        );
    },
);
