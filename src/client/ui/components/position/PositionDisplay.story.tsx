import React, { StrictMode } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { InferProps } from "@rbxts/ui-labs";
import PositionDisplay from "client/ui/components/position/PositionDisplay";
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
                <PositionDisplay {...props.controls} />
                <TooltipDisplay />
            </StrictMode>
        );
    },
};
