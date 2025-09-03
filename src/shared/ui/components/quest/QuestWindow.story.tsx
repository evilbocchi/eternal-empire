import React, { useEffect, useState } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { InferProps } from "@rbxts/ui-labs";
import HotkeyProvider from "shared/ui/components/hotkeys/HotkeyProvider";
import QuestWindow from "shared/ui/components/quest/QuestWindow";
import StoryMocking from "shared/ui/components/StoryMocking";
import TooltipProvider from "shared/ui/components/tooltip/TooltipProvider";
import WindowManager from "shared/ui/components/window/WindowManager";

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
            <HotkeyProvider>
                <TooltipProvider>
                    <WindowManager>
                        <QuestWindow visible={visible} onClose={() => setVisible(false)} />
                    </WindowManager>
                </TooltipProvider>
            </HotkeyProvider>
        );
    },
};
