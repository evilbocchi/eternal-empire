import React, { StrictMode } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import PositionWindow from "client/ui/components/position/PositionWindow";
import TooltipWindow from "client/ui/components/tooltip/TooltipWindow";
import useVisibility from "client/ui/hooks/useVisibility";

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
