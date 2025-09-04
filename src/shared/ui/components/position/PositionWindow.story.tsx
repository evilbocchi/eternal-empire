import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { InferProps } from "@rbxts/ui-labs";
import PositionWindow from "shared/ui/components/position/PositionWindow";

const controls = {
    visible: true,
};

export = {
    react: React,
    reactRoblox: ReactRoblox,
    controls: controls,
    story: (props: InferProps<typeof controls>) => {
        return <PositionWindow position={new Vector3(100, 50, 200)} {...props.controls} />;
    },
};
