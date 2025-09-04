import React, { StrictMode } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { InferProps } from "@rbxts/ui-labs";
import PositionManager from "client/ui/components/position/PositionManager";
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
                <PositionManager {...props.controls} />
                <TooltipDisplay />
            </StrictMode>
        );
    },
};
