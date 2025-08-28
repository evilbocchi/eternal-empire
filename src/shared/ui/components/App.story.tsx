import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import App from "shared/ui/components/App";
import { mockData } from "shared/ui/components/StoryMocking";

const controls = {
    Visible: true,
};

export = {
    react: React,
    reactRoblox: ReactRoblox,
    controls: controls,
    story: () => {
        mockData();

        const component = <App />;
        return component;
    },
};