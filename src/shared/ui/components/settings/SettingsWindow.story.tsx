import React, { StrictMode, useEffect, useState } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { InferProps } from "@rbxts/ui-labs";
import SettingsWindow from "shared/ui/components/settings/SettingsWindow";
import StoryMocking from "shared/ui/components/StoryMocking";

const controls = {
    visible: true,
};

export = {
    react: React,
    reactRoblox: ReactRoblox,
    controls: controls,
    story: (props: InferProps<typeof controls>) => {
        StoryMocking.mockData();

        const [visible, setVisible] = useState(false);
        useEffect(() => {
            setVisible(props.controls.visible);
        }, [props.controls.visible]);

        return (
            <StrictMode>
                <SettingsWindow visible={visible} />
            </StrictMode>
        );
    },
};
