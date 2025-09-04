import React, { StrictMode } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { InferProps } from "@rbxts/ui-labs";
import PositionWindow from "client/ui/components/position/PositionWindow";
import { TooltipDisplay } from "client/ui/components/tooltip/TooltipManager";

const controls = {
    visible: true,
};

export = {
    react: React,
    reactRoblox: ReactRoblox,
    controls: controls,
    story: (props: InferProps<typeof controls>) => {
        return (
            <StrictMode>
                <PositionWindow position={new Vector3(100, 50, 200)} {...props.controls} />
                <TooltipDisplay />
            </StrictMode>
        );
    },
};
