import React, { useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import SidebarButtons from "client/ui/components/sidebar/SidebarButtons";
import WindowManager from "client/ui/components/window/WindowManager";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            visible: true,
        },
    },
    (props) => {
        useEffect(() => {
            WindowManager.setWindowVisible("Sidebar", props.controls.visible);
        }, [props.controls.visible]);

        return <SidebarButtons />;
    },
);
