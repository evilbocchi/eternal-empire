import React, { StrictMode, useState } from "@rbxts/react";
import type BuildController from "client/controllers/gameplay/BuildController";
import BuildManager from "shared/ui/components/build/BuildManager";
import { ClickSparkManager } from "shared/ui/components/effect/ClickSpark";
import HotkeyProvider from "shared/ui/components/hotkeys/HotkeyProvider";
import PositionDisplay from "shared/ui/components/position/PositionDisplay";
import QuestWindow from "shared/ui/components/quest/QuestWindow";
import TrackedQuestWindow from "shared/ui/components/quest/TrackedQuestWindow";
import SettingsManager from "shared/ui/components/settings/SettingsManager";
import SidebarButtons from "shared/ui/components/sidebar/SidebarButtons";
import TooltipProvider from "shared/ui/components/tooltip/TooltipProvider";

interface AppProps {
    /** Build controller interface for React integration */
    buildController?: BuildController;
}

export default function App({ buildController }: AppProps = {}) {
    const [activeWindow, setActiveWindow] = useState<string | undefined>(undefined);

    return (
        <StrictMode>
            <HotkeyProvider>
                <TooltipProvider>
                    <ClickSparkManager />
                    <SettingsManager />
                    <PositionDisplay />
                    <TrackedQuestWindow />
                    <BuildManager
                        buildController={buildController}
                    />

                    <SidebarButtons onToggleWindow={(windowName) => {
                        const newActive = activeWindow === windowName ? undefined : windowName;
                        setActiveWindow(newActive);
                        return newActive === windowName;
                    }} />
                    <QuestWindow visible={activeWindow === "Quests"} onClose={() => setActiveWindow(undefined)} />
                </TooltipProvider>
            </HotkeyProvider>
        </StrictMode>
    );
}