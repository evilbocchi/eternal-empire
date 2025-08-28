/**
 * @fileoverview Client controller for managing React-based sidebar buttons
 *
 * Handles:
 * - Rendering React sidebar buttons
 * - Integrating sidebar button clicks with window controllers
 * - Managing sidebar visibility and animations
 * - Hotkey integration for buttons
 *
 * This replaces the sidebar functionality previously handled by AdaptiveTabController
 * and integrates with the new standalone window system.
 *
 * @since 1.0.0
 */
import { Controller, OnInit } from "@flamework/core";
import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { UserInputService } from "@rbxts/services";
import { INTERFACE } from "client/controllers/core/UIController";
import StandaloneQuestWindowController from "client/controllers/interface/StandaloneQuestWindowController";
import { playSound } from "shared/asset/GameAssets";
import SidebarButtons from "shared/ui/components/sidebar/SidebarButtons";

/**
 * Controller responsible for managing React-based sidebar buttons and their integration
 * with the new standalone window system.
 */
@Controller()
export default class ReactSidebarController implements OnInit {
    private root?: ReactRoblox.Root;
    private container: Frame;
    private isVisible = true;

    constructor(
        private standaloneQuestWindowController: StandaloneQuestWindowController
    ) {
        // Create the container frame in the main interface
        this.container = new Instance("Frame");
        this.container.Name = "ReactSidebarContainer";
        this.container.BackgroundTransparency = 1;
        this.container.Size = new UDim2(1, 0, 1, 0);
        this.container.Position = new UDim2(0, 0, 0, 0);
        this.container.Parent = INTERFACE;
    }

    /**
     * Shows the sidebar buttons.
     */
    showSidebarButtons() {
        this.isVisible = true;
        this.updateSidebar();
    }

    /**
     * Hides the sidebar buttons.
     */
    hideSidebarButtons() {
        this.isVisible = false;
        this.updateSidebar();
    }

    /**
     * Handles button clicks from the sidebar.
     * @param buttonName The name of the button that was clicked.
     */
    private handleButtonClick = (buttonName: string): void => {
        // Handle specific button actions
        switch (buttonName) {
            case "Quests":
                this.handleQuestsClick();
                break;
            // Add other button handlers here as needed
            default:
                print(`Button clicked: ${buttonName}`);
                break;
        }
    };

    /**
     * Handles window toggle requests from the sidebar.
     * @param windowName The name of the window to toggle.
     * @returns True if the window was shown, false if hidden.
     */
    private handleToggleWindow = (windowName: string): boolean => {
        switch (windowName) {
            case "Quests":
                return this.standaloneQuestWindowController.toggleQuestWindow();
            // Add other window toggle handlers here as needed
            default:
                print(`Window toggle requested: ${windowName}`);
                return false;
        }
    };

    /**
     * Handles the Quests button click specifically.
     */
    private handleQuestsClick(): void {
        const wasShown = this.standaloneQuestWindowController.toggleQuestWindow();
        
        if (wasShown) {
            playSound("MenuOpen.mp3");
        } else {
            playSound("MenuClose.mp3");
        }
    }

    /**
     * Gets the currently active window for highlighting purposes.
     * @returns The name of the currently active window, or undefined.
     */
    private getActiveWindow(): string | undefined {
        if (this.standaloneQuestWindowController.isQuestWindowVisible()) {
            return "Quests";
        }
        // Add other window checks here as needed
        return undefined;
    }

    /**
     * Updates the React sidebar component to reflect the current state.
     */
    private updateSidebar() {
        if (!this.root) {
            this.root = ReactRoblox.createRoot(this.container);
        }

        this.root.render(
            <SidebarButtons 
                visible={this.isVisible}
                onButtonClick={this.handleButtonClick}
                onToggleWindow={this.handleToggleWindow}
                activeWindow={this.getActiveWindow()}
                animationsEnabled={true}
            />
        );
    }

    /**
     * Sets up hotkey handling for sidebar buttons.
     */
    private setupHotkeys() {
        UserInputService.InputBegan.Connect((input, gameProcessed) => {
            if (gameProcessed) return;

            switch (input.KeyCode) {
                case Enum.KeyCode.V:
                    this.handleQuestsClick();
                    break;
                // Add other hotkeys here as needed
            }
        });
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
        // Initialize the React sidebar
        this.updateSidebar();
        
        // Set up hotkey handling
        this.setupHotkeys();
    }
}