import React, { Fragment, useState } from "@rbxts/react";
import type ToolController from "client/controllers/gameplay/ToolController";
import type InventoryController from "client/controllers/interface/InventoryController";
import BackpackManager from "client/ui/components/backpack/BackpackManager";
import InventoryWindow from "client/ui/components/inventory/InventoryWindow";
import PositionManager from "client/ui/components/position/PositionManager";
import QuestWindow from "client/ui/components/quest/QuestWindow";
import TrackedQuestWindow from "client/ui/components/quest/TrackedQuestWindow";
import SettingsWindow from "client/ui/components/settings/SettingsWindow";
import SidebarButtons from "client/ui/components/sidebar/SidebarButtons";

interface AppProps {
    /** Inventory controller interface for React integration */
    inventoryController?: InventoryController;
    /** Tool controller interface for React integration */
    toolController?: ToolController;
}

export default function App({ inventoryController, toolController }: AppProps = {}) {
    const [activeWindow, setActiveWindow] = useState<string | undefined>(undefined);

    // Handle window toggle
    const handleWindowToggle = (windowName: string): boolean => {
        const isCurrentlyActive = activeWindow === windowName;
        const newActive = isCurrentlyActive ? undefined : windowName;
        setActiveWindow(newActive);
        return newActive === windowName;
    };

    return (
        <Fragment>
            <PositionManager />
            <TrackedQuestWindow />
            <BackpackManager toolController={toolController} />

            <SidebarButtons onToggleWindow={handleWindowToggle} />

            <SettingsWindow visible={activeWindow === "Settings"} onClose={() => setActiveWindow(undefined)} />

            <QuestWindow visible={activeWindow === "Quests"} onClose={() => setActiveWindow(undefined)} />

            <InventoryWindow
                visible={activeWindow === "Inventory"}
                onClose={() => setActiveWindow(undefined)}
                inventoryController={inventoryController}
            />
        </Fragment>
    );
}
