import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { InferProps } from "@rbxts/ui-labs";
import PositionDisplay from "shared/ui/components/position/PositionDisplay";

const controls = {
    visible: true,
};

export = {
    react: React,
    reactRoblox: ReactRoblox,
    controls: controls,
    story: (props: InferProps<typeof controls>) => {
        return <PositionDisplay {...props.controls} />;
    },
};
