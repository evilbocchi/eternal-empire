/**
 * @fileoverview Client controller for managing the standalone quest window
 *
 * Handles:
 * - Displaying and hiding the standalone quest window
 * - Managing window state independent of the adaptive tab system
 * - Integration with sidebar buttons and hotkeys
 *
 * This replaces the quest functionality previously handled by AdaptiveTabController.
 *
 * @since 1.0.0
 */
import { Controller, OnInit } from "@flamework/core";
import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { INTERFACE } from "client/controllers/core/UIController";
import StandaloneQuestWindow from "shared/ui/components/quest/StandaloneQuestWindow";

/**
 * Controller responsible for managing the standalone quest window.
 * 
 * Handles window visibility, animations, and integration with other UI systems.
 */
@Controller()
export default class StandaloneQuestWindowController implements OnInit {
    private root?: ReactRoblox.Root;
    private container: Frame;
    private isVisible = false;

    constructor() {
        // Create the container frame in the main interface
        this.container = new Instance("Frame");
        this.container.Name = "StandaloneQuestWindowContainer";
        this.container.BackgroundTransparency = 1;
        this.container.Size = new UDim2(1, 0, 1, 0);
        this.container.Position = new UDim2(0, 0, 0, 0);
        this.container.Parent = INTERFACE;
    }

    /**
     * Shows the standalone quest window.
     */
    showQuestWindow() {
        if (this.isVisible) return;
        
        this.isVisible = true;
        this.updateWindow();
    }

    /**
     * Hides the standalone quest window.
     */
    hideQuestWindow() {
        if (!this.isVisible) return;
        
        this.isVisible = false;
        this.updateWindow();
    }

    /**
     * Toggles the standalone quest window visibility.
     * @returns True if the window was shown, false if hidden.
     */
    toggleQuestWindow(): boolean {
        if (this.isVisible) {
            this.hideQuestWindow();
            return false;
        } else {
            this.showQuestWindow();
            return true;
        }
    }

    /**
     * Gets the current visibility state of the quest window.
     * @returns True if the window is currently visible.
     */
    isQuestWindowVisible(): boolean {
        return this.isVisible;
    }

    /**
     * Updates the React component to reflect the current window state.
     */
    private updateWindow() {
        if (!this.root) {
            this.root = ReactRoblox.createRoot(this.container);
        }

        this.root.render(
            <StandaloneQuestWindow 
                visible={this.isVisible}
                onClose={() => this.hideQuestWindow()}
            />
        );
    }

    /**
     * Cleans up the React root and container.
     */
    destroy() {
        if (this.root) {
            this.root.unmount();
            this.root = undefined;
        }
        this.container.Destroy();
    }

    onInit() {
        // Initialize the React component
        this.updateWindow();
    }
}