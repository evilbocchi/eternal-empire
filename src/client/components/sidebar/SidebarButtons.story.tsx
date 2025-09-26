import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import SidebarButtons from "client/components/sidebar/SidebarButtons";
import useVisibility from "client/hooks/useVisibility";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            visible: true,
        },
    },
    (props) => {
        useVisibility("Sidebar", props.controls.visible);
        return <SidebarButtons />;
    },
);
