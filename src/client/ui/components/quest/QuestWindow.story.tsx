import React, { StrictMode, useEffect, useState } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { InferProps } from "@rbxts/ui-labs";
import QuestWindow from "client/ui/components/quest/QuestWindow";
import StoryMocking from "client/ui/components/StoryMocking";
import { TooltipDisplay } from "client/ui/components/tooltip/TooltipManager";

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
                <QuestWindow visible={visible} onClose={() => setVisible(false)} />
                <TooltipDisplay />
            </StrictMode>
        );
    },
};
