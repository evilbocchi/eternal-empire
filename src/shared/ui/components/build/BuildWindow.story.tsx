import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { InferProps } from "@rbxts/ui-labs";
import BuildWindow from "shared/ui/components/build/BuildWindow";

const controls = {
    visible: true,
    hasSelection: true,
    isRestricted: false,
    animationsEnabled: true,
};

export = {
    react: React,
    reactRoblox: ReactRoblox,
    controls: controls,
    story: (props: InferProps<typeof controls>) => {
        const state = {
            visible: props.controls.visible,
            hasSelection: props.controls.hasSelection,
            isRestricted: props.controls.isRestricted,
            animationsEnabled: props.controls.animationsEnabled,
        };

        const callbacks = {
            onDeselect: () => print("Deselect clicked"),
            onRotate: () => print("Rotate clicked"),
            onDelete: () => print("Delete clicked"),
            onPlace: () => print("Place clicked"),
        };

        return <BuildWindow state={state} callbacks={callbacks} />;
    },
};
