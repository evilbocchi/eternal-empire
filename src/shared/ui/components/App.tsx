import React, { StrictMode, useState } from "@rbxts/react";
import type BuildController from "client/controllers/gameplay/BuildController";
import type InventoryController from "client/controllers/interface/InventoryController";
import type ToolController from "client/controllers/gameplay/ToolController";
import BackpackManager from "shared/ui/components/backpack/BackpackManager";
import BuildManager from "shared/ui/components/build/BuildManager";
import { ClickSparkManager } from "shared/ui/components/effect/ClickSpark";
import HotkeyProvider from "shared/ui/components/hotkeys/HotkeyProvider";
import InventoryWindow from "shared/ui/components/inventory/InventoryWindow";
import PositionDisplay from "shared/ui/components/position/PositionDisplay";
import QuestWindow from "shared/ui/components/quest/QuestWindow";
import TrackedQuestWindow from "shared/ui/components/quest/TrackedQuestWindow";
import SettingsManager from "shared/ui/components/settings/SettingsManager";
import SidebarButtons from "shared/ui/components/sidebar/SidebarButtons";
import TooltipProvider from "shared/ui/components/tooltip/TooltipProvider";

interface AppProps {
    /** Build controller interface for React integration */
    buildController?: BuildController;
    /** Inventory controller interface for React integration */
    inventoryController?: InventoryController;
    /** Tool controller interface for React integration */
    toolController?: ToolController;
}

export default function App({ buildController, inventoryController, toolController }: AppProps = {}) {
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
                    <BackpackManager
                        toolController={toolController}
                    />

                    <SidebarButtons onToggleWindow={(windowName) => {
                        const newActive = activeWindow === windowName ? undefined : windowName;
                        setActiveWindow(newActive);
                        return newActive === windowName;
                    }} />
                    
                    <QuestWindow visible={activeWindow === "Quests"} onClose={() => setActiveWindow(undefined)} />
                    
                    <InventoryWindow 
                        visible={activeWindow === "Inventory"} 
                        onClose={() => setActiveWindow(undefined)}
                        inventoryController={inventoryController}
                    />
                </TooltipProvider>
            </HotkeyProvider>
        </StrictMode>
    );
}