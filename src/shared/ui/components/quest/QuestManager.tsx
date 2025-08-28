import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import QuestWindow from "shared/ui/components/quest/QuestWindow";

interface QuestManagerProps {
    /** The container frame where the quest window should be mounted */
    container: Frame;
}

/**
 * Quest Manager component that mounts React quest UI into an existing Roblox container.
 * This replaces the imperative quest management in QuestsController.
 */
export default class QuestManager {
    private root?: ReactRoblox.Root;

    constructor(private container: Frame) {
        this.mount();
    }

    mount() {
        if (this.root) {
            this.unmount();
        }

        // Clear existing content
        this.container.GetChildren().forEach(child => {
            if (child.IsA("GuiObject")) {
                child.Destroy();
            }
        });

        // Create React root and render quest window
        this.root = ReactRoblox.createRoot(this.container);
        this.root.render(<QuestWindow />);
    }

    unmount() {
        if (this.root) {
            this.root.unmount();
            this.root = undefined;
        }
    }

    destroy() {
        this.unmount();
    }
}