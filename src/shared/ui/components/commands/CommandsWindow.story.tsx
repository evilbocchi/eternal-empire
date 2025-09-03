import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { InferProps } from "@rbxts/ui-labs";
import CommandsWindow from "shared/ui/components/commands/CommandsWindow";

const controls = {
    visible: true,
    userPermissionLevel: 4,
};

export = {
    react: React,
    reactRoblox: ReactRoblox,
    controls: controls,
    story: (props: InferProps<typeof controls>) => {
        return <CommandsWindow {...props.controls} />;
    },
};
