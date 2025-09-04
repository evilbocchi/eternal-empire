import React, { Fragment, useEffect, useRef, useState } from "@rbxts/react";
import type BuildController from "client/controllers/gameplay/BuildController";
import type ToolController from "client/controllers/gameplay/ToolController";
import type InventoryController from "client/controllers/interface/InventoryController";
import BackpackManager from "shared/ui/components/backpack/BackpackManager";
import BuildManager from "shared/ui/components/build/BuildManager";
import InventoryWindow from "shared/ui/components/inventory/InventoryWindow";
import PositionDisplay from "shared/ui/components/position/PositionDisplay";
import QuestWindow from "shared/ui/components/quest/QuestWindow";
import TrackedQuestWindow from "shared/ui/components/quest/TrackedQuestWindow";
import SettingsWindow from "shared/ui/components/settings/SettingsWindow";
import SidebarButtons from "shared/ui/components/sidebar/SidebarButtons";

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
    const [mountedWindows, setMountedWindows] = useState<string[]>([]);
    const unmountTasksRef = useRef<Map<string, thread>>(new Map());

    // Function to mount a window
    const mountWindow = (windowName: string) => {
        setMountedWindows((prev) => {
            if (!prev.includes(windowName)) {
                return [...prev, windowName];
            }
            return prev;
        });
        // Cancel any existing unmount task for this window
        const existingTask = unmountTasksRef.current.get(windowName);
        if (existingTask !== undefined) {
            task.cancel(existingTask);
            unmountTasksRef.current.delete(windowName);
        }
    };

    // Function to schedule unmounting of a window
    const scheduleUnmount = (windowName: string) => {
        // Cancel any existing task first
        const existingTask = unmountTasksRef.current.get(windowName);
        if (existingTask !== undefined) {
            task.cancel(existingTask);
        }

        // Spawn a new task to unmount after 1 second
        const unmountTask = task.delay(1, () => {
            setMountedWindows((prev) => prev.filter((name) => name !== windowName));
            unmountTasksRef.current.delete(windowName);
        });

        unmountTasksRef.current.set(windowName, unmountTask);
    };

    // Handle window toggle with mounting/unmounting logic
    const handleWindowToggle = (windowName: string): boolean => {
        const isCurrentlyActive = activeWindow === windowName;
        const newActive = isCurrentlyActive ? undefined : windowName;
        if (newActive === windowName) {
            // Window is being opened - mount it
            mountWindow(windowName);
        } else {
            // Window is being closed - schedule unmount
            scheduleUnmount(windowName);
        }
        setActiveWindow(newActive);
        return newActive === windowName;
    };

    // Clean up tasks on unmount
    useEffect(() => {
        return () => {
            for (const [_, unmountTask] of unmountTasksRef.current) {
                task.cancel(unmountTask);
            }
            unmountTasksRef.current.clear();
        };
    }, []);

    return (
        <Fragment>
            <PositionDisplay />
            <TrackedQuestWindow />
            <BuildManager buildController={buildController} />
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
