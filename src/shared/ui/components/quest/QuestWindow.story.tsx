import React, { useState } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { InferProps } from "@rbxts/ui-labs";
import HotkeyProvider from "shared/ui/components/hotkeys/HotkeyProvider";
import QuestWindow from "shared/ui/components/quest/QuestWindow";
import SidebarButtons from "shared/ui/components/sidebar/SidebarButtons";
import StoryMocking from "shared/ui/components/StoryMocking";
import TooltipProvider from "shared/ui/components/tooltip/TooltipProvider";

const controls = {
    visible: true
};

export = {
    react: React,
    reactRoblox: ReactRoblox,
    controls: controls,
    story: (props: InferProps<typeof controls>) => {
        StoryMocking.mockData();

        const [activeWindow, setActiveWindow] = useState<string | undefined>(undefined);

        return (
            <HotkeyProvider>
                <TooltipProvider>
                    <SidebarButtons onToggleWindow={(windowName) => {
                        const newActive = activeWindow === windowName ? undefined : windowName;
                        setActiveWindow(newActive);
                        return newActive === windowName;
                    }} />
                    <QuestWindow visible={activeWindow === "Quests"} onClose={() => setActiveWindow(undefined)} />
                </TooltipProvider>
            </HotkeyProvider>
        );
    }
};