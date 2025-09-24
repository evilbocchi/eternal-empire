import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import SetupOption from "client/ui/components/world/printer/SetupOption";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            Visible: true,
        },
    },
    (props) => {
        const component = <SetupOption />;
        return component;
    },
);
