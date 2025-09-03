import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { InferProps } from "@rbxts/ui-labs";
import PositionWindow from "shared/ui/components/position/PositionWindow";
import TooltipProvider from "shared/ui/components/tooltip/TooltipProvider";

const controls = {
    visible: true,
};

export = {
    react: React,
    reactRoblox: ReactRoblox,
    controls: controls,
    story: (props: InferProps<typeof controls>) => {
        return (
            <TooltipProvider>
                <PositionWindow position={new Vector3(100, 50, 200)} {...props.controls} />
            </TooltipProvider>
        );
    },
};
