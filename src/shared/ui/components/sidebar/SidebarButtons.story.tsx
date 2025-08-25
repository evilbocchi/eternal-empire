import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { InferProps } from "@rbxts/ui-labs";
import SidebarButtons from "shared/ui/components/sidebar/SidebarButtons";

const controls = {
    Visible: true,
};

export = {
    react: React,
    reactRoblox: ReactRoblox,
    controls: controls,
    story: (props: InferProps<typeof controls>) => {
        const component = <SidebarButtons />;
        return component;
    },
};