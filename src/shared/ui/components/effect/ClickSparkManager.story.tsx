import React, { StrictMode } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import ClickSparkManager from "./ClickSparkManager";

export = {
    react: React,
    reactRoblox: ReactRoblox,
    story: () => {
        return (
            <StrictMode>
                <ClickSparkManager />
            </StrictMode>
        );
    },
};
