import React, { StrictMode, useState } from "@rbxts/react";
import type BuildController from "client/controllers/gameplay/BuildController";
import type InventoryController from "client/controllers/interface/InventoryController";
import type AdaptiveTabController from "client/controllers/core/AdaptiveTabController";
import BuildManager from "shared/ui/components/build/BuildManager";
import { ClickSparkManager } from "shared/ui/components/effect/ClickSpark";
import HotkeyProvider from "shared/ui/components/hotkeys/HotkeyProvider";
import InventoryManager from "shared/ui/components/inventory/InventoryManager";
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
    /** Adaptive tab controller interface for React integration */
    adaptiveTabController?: AdaptiveTabController;
}

export default function App({ buildController, inventoryController, adaptiveTabController }: AppProps = {}) {
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
                    
                    <InventoryManager 
                        inventoryController={inventoryController}
                        buildController={buildController}
                        adaptiveTabController={adaptiveTabController}
                        visible={activeWindow === "Inventory"} 
                        onClose={() => setActiveWindow(undefined)} 
                    />
                </TooltipProvider>
            </HotkeyProvider>
        </StrictMode>
    );
}