import React, { StrictMode } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import PositionWindow from "client/components/position/PositionWindow";
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
                <PositionWindow characterPosition={new Vector3(100, 50, 200)} />
                <TooltipWindow />
            </StrictMode>
        );
    },
);
