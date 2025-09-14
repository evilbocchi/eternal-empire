import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import BuildWindow from "client/ui/components/build/BuildWindow";
import useVisibility from "client/ui/hooks/useVisibility";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            visible: true,
            hasSelection: true,
            isRestricted: false,
            animationsEnabled: true,
        },
    },
    (props) => {
        const state = {
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

        useVisibility("Build", props.controls.visible);

        return <BuildWindow state={state} callbacks={callbacks} />;
    },
);
